#!/usr/bin/env bash
#
# Se ejecuta EN LA INSTANCIA de Oracle Cloud: el workflow de despliegue lo
# envía por stdin (`ssh ... 'bash -s' < deploy/remote-deploy.sh`), de modo que
# el servidor nunca necesita una copia del repositorio.
#
# Variables que llegan por el entorno del comando SSH:
#   IMAGE_REPOSITORY  base de las imágenes en GHCR (sin el sufijo /app o /web)
#   IMAGE_TAG         etiqueta a desplegar (normalmente el SHA del commit)
#   DEPLOY_PATH       directorio con compose.prod.yaml y .env
#   GHCR_USER/TOKEN   opcionales; solo si los paquetes son privados
#   APP_DOMAIN        opcional; si llega, debe coincidir con el del .env

set -euo pipefail

: "${IMAGE_REPOSITORY:?falta IMAGE_REPOSITORY}"
: "${IMAGE_TAG:?falta IMAGE_TAG}"
: "${DEPLOY_PATH:?falta DEPLOY_PATH}"

cd "$DEPLOY_PATH"

compose() { docker compose -f compose.prod.yaml "$@"; }

# El script lee y reescribe .env (guarda ahí IMAGE_TAG). Si el archivo se creó
# con sudo queda como root:root y el usuario de despliegue no puede tocarlo:
# sin esta comprobación el `grep` de más abajo falla en silencio, reporta
# «Versión actual: (ninguna)» y recién revienta al escribir.
if [ ! -f .env ]; then
    echo "ERROR: falta ${DEPLOY_PATH}/.env (ver docs/ci-cd.md, Paso 5)." >&2
    exit 1
fi
if [ ! -r .env ] || [ ! -w .env ]; then
    echo "ERROR: ${DEPLOY_PATH}/.env no es legible y escribible por $(id -un)." >&2
    echo "       En la instancia: sudo chown $(id -un):$(id -gn) ${DEPLOY_PATH}/.env" >&2
    exit 1
fi

# --- El dominio está configurado en dos sitios --------------------------
# `vars.APP_DOMAIN` en GitHub (lo usa la verificación final del workflow y el
# vhost de Apache) y APP_URL en este .env (de ahí salen las URLs absolutas que
# genera Laravel). Si divergen, el despliegue "funciona" pero los enlaces y las
# redirecciones apuntan a otro sitio, que es un fallo silencioso.
if [ -n "${APP_DOMAIN:-}" ]; then
    env_url="$(grep -E '^APP_URL=' .env | head -1 | cut -d= -f2- | tr -d '"'"'"'\r ')"
    env_host="${env_url#*://}"
    env_host="${env_host%%/*}"
    if [ "$env_host" != "$APP_DOMAIN" ]; then
        echo "ERROR: el dominio no coincide." >&2
        echo "       GitHub (vars.APP_DOMAIN): ${APP_DOMAIN}" >&2
        echo "       APP_URL en ${DEPLOY_PATH}/.env: ${env_url:-(vacío)}" >&2
        exit 1
    fi
fi

# --- Etiqueta anterior, para poder volver atrás -------------------------
previous_tag="$(grep -E '^IMAGE_TAG=' .env | cut -d= -f2- || true)"
echo "==> Versión actual: ${previous_tag:-(ninguna)}"
echo "==> Versión a desplegar: ${IMAGE_TAG}"

write_tag() {
    if grep -qE '^IMAGE_TAG=' .env; then
        sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=$1|" .env
    else
        echo "IMAGE_TAG=$1" >> .env
    fi
}

# Si algo falla a partir de aquí se restaura la versión anterior. Ojo: esto
# revierte las imágenes, NO las migraciones ya aplicadas. Por eso las
# migraciones deben ser compatibles hacia atrás (añadir antes de eliminar).
rollback() {
    local status=$?
    if [ "$status" -ne 0 ] && [ -n "$previous_tag" ]; then
        echo "==> Falló el despliegue; restaurando ${previous_tag}"
        write_tag "$previous_tag"
        compose up -d --wait || echo "==> No se pudo restaurar; revisar el servidor a mano."
    fi
    exit "$status"
}
trap rollback EXIT

# --- Autenticación en el registro (solo si el paquete es privado) --------
if [ -n "${GHCR_TOKEN:-}" ]; then
    echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER:?falta GHCR_USER}" --password-stdin
fi

write_tag "$IMAGE_TAG"
export IMAGE_REPOSITORY IMAGE_TAG

# --- Descargar las dos imágenes antes de tocar nada ----------------------
echo "==> Descargando imágenes"
compose pull

# --- Migraciones con la base arriba y la versión nueva -------------------
echo "==> Aplicando migraciones"
compose up -d --wait db
compose run --rm app php artisan migrate --force

# --- Reemplazar los contenedores ----------------------------------------
echo "==> Levantando la versión nueva"
compose up -d --wait --remove-orphans

# --- Limpieza -----------------------------------------------------------
# Se conservan dos semanas de imágenes para que el rollback siga siendo
# posible sin volver a descargar desde GHCR.
docker image prune -af --filter "until=336h" > /dev/null || true

trap - EXIT
echo "==> Despliegue completado: ${IMAGE_TAG}"
compose ps
