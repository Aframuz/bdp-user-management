<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // `app-test` comparte el bind mount del proyecto con el contenedor
        // `vite`, así que ve el mismo `public/hot`. Si ese fichero queda
        // huérfano (p. ej. tras `docker compose stop vite`, que mata vite
        // antes de que borre el hot file), Blade apuntaría los assets al dev
        // server inexistente y la SPA nunca montaría: los tests E2E fallarían
        // con la página vacía. En testing forzamos siempre el manifest
        // apuntando el hot file a una ruta que nunca existe.
        if ($this->app->environment('testing')) {
            Vite::useHotFile(storage_path('framework/testing-vite.hot'));
        }
    }
}
