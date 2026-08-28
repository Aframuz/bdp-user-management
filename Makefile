.PHONY: setup up down reset-db test-backend build

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

build:
	docker compose run --rm vite pnpm build
