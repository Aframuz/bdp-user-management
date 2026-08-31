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

set -euo pipefail

: "${IMAGE_REPOSITORY:?falta IMAGE_REPOSITORY}"
: "${IMAGE_TAG:?falta IMAGE_TAG}"
: "${DEPLOY_PATH:?falta DEPLOY_PATH}"

cd "$DEPLOY_PATH"

compose() { docker compose -f compose.prod.yaml "$@"; }

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
