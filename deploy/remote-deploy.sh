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

# Comprueba el puerto publicado DESDE EL HOST, que es por donde entra Apache.
probe_host_port() {
    local port="$1" i
    for i in $(seq 1 10); do
        if command -v curl >/dev/null 2>&1; then
            curl -fsS --max-time 5 "http://127.0.0.1:${port}/up" >/dev/null 2>&1 && return 0
        elif command -v wget >/dev/null 2>&1; then
            wget -q -O /dev/null --timeout=5 "http://127.0.0.1:${port}/up" 2>/dev/null && return 0
        else
            (exec 3<>"/dev/tcp/127.0.0.1/${port}") 2>/dev/null && return 0
        fi
        sleep 3
    done
    return 1
}

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

# --- La clave de la aplicación tiene que ser utilizable -----------------
# Un APP_KEY sin el prefijo `base64:` (pegar tal cual la salida de
# `openssl rand -base64 32` es el error típico) deja la aplicación arrancando
# y respondiendo /up, pero revienta con "Unsupported cipher or incorrect key
# length" en cuanto una ruta usa sesión o cookies cifradas: es decir, en todo
# el sitio menos el healthcheck. Vale más pararlo aquí.
app_key="$(grep -E '^APP_KEY=' .env | head -1 | cut -d= -f2- | tr -d '"'"'"'\r ')"
case "$app_key" in
    base64:*)
        key_bytes="$(printf '%s' "${app_key#base64:}" | base64 -d 2>/dev/null | wc -c)"
        if [ "$key_bytes" -ne 32 ]; then
            echo "ERROR: APP_KEY decodifica a ${key_bytes} bytes; AES-256-CBC necesita 32." >&2
            echo "       Regenerar con: echo \"base64:\$(openssl rand -base64 32)\"" >&2
            exit 1
        fi
        ;;
    "")
        echo "ERROR: APP_KEY está vacío en ${DEPLOY_PATH}/.env." >&2
        echo "       Generar con: echo \"base64:\$(openssl rand -base64 32)\"" >&2
        exit 1
        ;;
    *)
        echo "ERROR: APP_KEY no lleva el prefijo 'base64:'." >&2
        echo "       Laravel lo trata como clave en crudo y falla en toda ruta con sesión." >&2
        echo "       Regenerar con: echo \"base64:\$(openssl rand -base64 32)\"" >&2
        exit 1
        ;;
esac

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
# `-T` y el redirect son imprescindibles: `compose run` se conecta a stdin y,
# si el script llegara por ahí, se comería el resto (incluido el `up` de abajo)
# dejando el despliegue a medias con estado de salida 0.
compose run --rm -T app php artisan migrate --force < /dev/null

# --- Reemplazar los contenedores ----------------------------------------
echo "==> Levantando la versión nueva"
compose up -d --wait --remove-orphans

# --- Limpieza -----------------------------------------------------------
# Se conservan dos semanas de imágenes para que el rollback siga siendo
# posible sin volver a descargar desde GHCR.
docker image prune -af --filter "until=336h" > /dev/null || true

trap - EXIT

# --- El puerto publicado tiene que responder en el host -----------------
# El healthcheck de compose corre DENTRO del contenedor, así que `web` sale
# "healthy" aunque la publicación en 127.0.0.1 no funcione. Apache entra por
# el host: si esto falla, el sitio da 503 con los contenedores en verde.
bind_port="$(grep -E '^HTTP_BIND_PORT=' .env | head -1 | cut -d= -f2- | tr -d '"'"'"'\r ')"
bind_port="${bind_port:-8080}"
echo "==> Comprobando http://127.0.0.1:${bind_port}/up desde el host"
if ! probe_host_port "$bind_port"; then
    echo "ERROR: los contenedores están arriba pero 127.0.0.1:${bind_port} no responde." >&2
    echo "       Apache no puede alcanzar el stack, así que el sitio dará 503." >&2
    compose ps >&2
    echo "--- Quién escucha en ${bind_port} ---" >&2
    ss -tlnp 2>/dev/null | grep ":${bind_port}" >&2 || echo "       Nadie." >&2
    echo "--- Últimas líneas de web ---" >&2
    compose logs --tail 20 web >&2 || true
    exit 1
fi

echo "==> Despliegue completado: ${IMAGE_TAG}"
compose ps
