.PHONY: setup up down reset-db test-backend test-frontend test-e2e quality build build-prod ci

setup:
	@test -f .env || cp .env.example .env
	docker compose build
	docker compose run --rm app composer install
	docker compose run --rm vite pnpm install --frozen-lockfile
	docker compose run --rm app php artisan key:generate
	docker compose up -d db
	docker compose run --rm app php artisan migrate --seed

up:
	docker compose up -d db app vite

down:
	docker compose down

reset-db:
	docker compose exec app php artisan migrate:fresh --seed

test-backend:
	docker compose --profile test run --rm app-test php artisan test

test-frontend:
	docker compose run --rm vite pnpm test

# `app-test` solo siembra al arrancar, y phpunit comparte esa misma base
# (ver phpunit.xml), así que `make test-backend` la deja vacía. Se resiembra
# antes de cada corrida para que E2E parta siempre del mismo estado.
test-e2e:
	docker compose --profile test up -d app-test
	docker compose --profile test exec -T app-test php artisan migrate:fresh --seed --force
	docker compose --profile test run --rm e2e

quality:
	docker compose run --rm app vendor/bin/pint --test
	docker compose run --rm vite pnpm typecheck
	docker compose run --rm vite pnpm lint

build:
	docker compose run --rm vite pnpm build

# Réplica local de la suite que ejecuta .github/workflows/ci.yml, en el mismo
# orden: sirve para no descubrir en el PR algo que se podía ver antes.
ci: quality test-backend test-frontend test-e2e

# Construye las dos imágenes de producción sin publicarlas. Útil para revisar
# un cambio en docker/php/Dockerfile.prod sin pasar por GitHub Actions.
build-prod:
	docker build -f docker/php/Dockerfile.prod --target app -t bdp-user-management/app:local .
	docker build -f docker/php/Dockerfile.prod --target web -t bdp-user-management/web:local .
