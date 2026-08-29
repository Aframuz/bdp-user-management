<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#3454d1">
        <title inertia>{{ config('app.name', 'Mantenedor de Usuarios') }}</title>
        @viteReactRefresh
        @vite('resources/js/app.tsx')
        @inertiaHead
    </head>
    <body>
        <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
        @inertia
    </body>
</html>
