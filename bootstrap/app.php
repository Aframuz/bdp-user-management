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
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Un 404 de navegación se responde con la página Inertia, para que el error
        // caiga dentro del panel y no en la pantalla en blanco de Symfony. Cubre
        // tanto las rutas inexistentes como los binding fallidos (/usuarios/9999).
        // Lo que espera JSON —la tabla y los tabs— sigue recibiendo el 404 pelado.
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if ($response->getStatusCode() !== 404 || $request->expectsJson()) {
                return $response;
            }

            return Inertia::render('NotFound', ['ruta' => Str::limit($request->getRequestUri(), 120)])
                ->toResponse($request)
                ->setStatusCode(404);
        });
    })->create();
