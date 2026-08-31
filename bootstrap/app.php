<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [HandleInertiaRequests::class]);

        // En producción la aplicación corre detrás de un proxy (Apache termina
        // el TLS en el host y reenvía a Caddy en 127.0.0.1). Las solicitudes
        // llegan por HTTP, así que sin confiar en `X-Forwarded-Proto` Laravel
        // generaría redirecciones `http://` y el navegador descartaría la
        // cookie de sesión, que va marcada como `secure`.
        //
        // Se confía en cualquier proxy porque el contenedor solo escucha en
        // localhost del servidor: nadie externo puede falsificar la cabecera.
        // Si algún día se publica el puerto, acotar con TRUSTED_PROXIES.
        $middleware->trustProxies(at: env('TRUSTED_PROXIES', '*'));
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Los errores de navegación se responden dentro del panel de Inertia. Además
        // del 404, el 500 cubre fallos como un binding bigint inválido (/usuarios/asdf)
        // sin exponer al visitante el mensaje SQL. Las solicitudes JSON conservan
        // la respuesta original para no romper el manejo de errores de sus clientes.
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if ($request->expectsJson()) {
                return $response;
            }

            $page = match ($response->getStatusCode()) {
                404 => 'NotFound',
                500 => 'ServerError',
                default => null,
            };

            if ($page === null) {
                return $response;
            }

            return Inertia::render($page, ['ruta' => Str::limit($request->getRequestUri(), 120)])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
        });
    })->create();
