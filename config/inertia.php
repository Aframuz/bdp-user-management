<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Server Side Rendering
    |--------------------------------------------------------------------------
    |
    | Este proyecto es solo cliente: no hay entrada `ssr` ni bundle en
    | `bootstrap/ssr`. En Inertia 3 el default de `enabled` es true y, cuando el
    | dev server de Vite está corriendo (existe `public/hot`), el gateway se
    | salta la comprobación del bundle y hace un POST a `/__inertia_ssr` en cada
    | carga. Falla y cae a CSR, pero es un viaje HTTP por request; apagarlo lo
    | evita y deja explícito que aquí no hay SSR.
    |
    | El merge de config solo combina el primer nivel, así que este bloque
    | reemplaza entero al del paquete. El resto de claves `ssr.*` no se leen con
    | SSR apagado, y todas tienen default propio en su `config()`.
    |
    */

    'ssr' => [

        'enabled' => (bool) env('INERTIA_SSR_ENABLED', false),

    ],

    /*
    |--------------------------------------------------------------------------
    | Pages
    |--------------------------------------------------------------------------
    |
    | Inertia 3 movió estas claves desde `testing.page_paths` / `page_extensions`
    | a `pages.paths` / `pages.extensions`, y su default pasó a ser `js/pages` en
    | minúscula. Aquí los componentes viven en `resources/js/Pages`, así que hay
    | que declararlo: en Linux el finder distingue mayúsculas y `assertInertia`
    | fallaría con "page component file does not exist".
    |
    | `mergeConfigFrom` combina solo el primer nivel, de modo que este bloque
    | reemplaza entero al del paquete: hay que repetir también `extensions` y
    | `ensure_pages_exist`.
    |
    */

    'pages' => [

        'ensure_pages_exist' => false,

        'paths' => [

            resource_path('js/Pages'),

        ],

        'extensions' => [

            'js',
            'jsx',
            'svelte',
            'ts',
            'tsx',
            'vue',

        ],

    ],

];
