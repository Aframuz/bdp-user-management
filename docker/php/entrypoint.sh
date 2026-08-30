#!/bin/sh
set -eu

# Las cachés de configuración y rutas se generan al arrancar, no en el build:
# `config:cache` congela el valor de env() y en build todavía no existe el .env
# del servidor. Regenerarlas aquí garantiza que reflejen el entorno real.
if [ "${1:-}" = "php-fpm" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    # Las cachés se acaban de escribir como root; los workers de php-fpm
    # corren como www-data y también escriben logs y sesiones.
    chown -R www-data:www-data storage bootstrap/cache
fi

exec "$@"
