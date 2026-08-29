<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#62ab52">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <title data-inertia>{{ config('app.name', 'Mantenedor de Usuarios') }}</title>
        @viteReactRefresh
        @vite('resources/js/app.tsx')
        @inertiaHead
        <style>
            #loader-main {
                margin: auto;
                position: fixed;
                left: 0;
                bottom: 0;
                right: 0;
                z-index: 999;
                background-color: #E4F1F2;
                height: 100%;
                width: 100%;
            }

            #logocontainer {
                display: block;
                position: fixed;
                top: 50%;
                left: 50%;
                width: 34vh;
                height: 34vh;
                margin: -17vh 0 0 -17vh;
                overflow: hidden;
                transition: background-color 0.5s ease;
                cursor: pointer;
            }

            #logo-bpc-loader svg {
                vertical-align: middle;
            }

            #logo-bpc-loader {
                display: block;
                position: absolute;
                left: 8vh;
                top: -1vh;
                width: 17vh;
                height: 22vh;
                background-size: contain;
                font-family: Trebuchet MS, sans-serif;
                font-size: 20vh;
                font-weight: bold;
                color: #3ebffa;
                text-align: center;
                line-height: 30vh;
            }

            .circular {
                animation: rotate 2s linear infinite;
                height: 100%;
                transform-origin: center center;
                width: 100%;
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: auto;
            }

            .circular .path {
                stroke: #4e9d2d;
                stroke-linecap: round;
                animation: loader-dash 1.5s ease-in-out infinite;
            }

            @keyframes rotate {
                100% {
                    transform: rotate(360deg);
                }
            }

            @keyframes loader-dash {
                0% {
                    stroke-dasharray: 1, 150;
                    stroke-dashoffset: 0;
                }
                50% {
                    stroke-dasharray: 90, 150;
                    stroke-dashoffset: -35;
                }
                100% {
                    stroke-dasharray: 90, 150;
                    stroke-dashoffset: -124;
                }
            }
        </style>
    </head>
    <body>
        {{-- Inertia 3 entrega la página inicial en un <script type="application/json">;
             el atributo data-page del contenedor ya no se lee. No usamos la directiva
             blade de Inertia porque emite su <div id="app"> vacío y aquí el loader vive
             dentro: React lo descarta al montar, en el mismo commit y sin parpadeo. --}}
        <script data-page="app" type="application/json">{!! json_encode($page) !!}</script>
        <div id="app">
            <div id="loader-main">
                <div id="logocontainer">
                    <div id="logo-bpc-loader">
                        <svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 176 183">
                            <defs>
                                <style>.cls-1{fill:#4e9d2d;}</style>
                            </defs>
                            <path class="cls-1" d="M10.34,185.71c1.88,4.89,10.94,5.73,20.23,1.85S45.87,176.62,44,171.74,33.05,166,23.77,169.88,8.46,180.82,10.34,185.71" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M45.76,185.71c1.88,4.89,10.93,5.73,20.22,1.85s15.31-10.94,13.43-15.82S68.47,166,59.17,169.88s-15.29,10.94-13.41,15.83" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M81.17,185.71c1.89,4.89,10.93,5.73,20.23,1.85s15.3-10.94,13.42-15.82-10.95-5.73-20.23-1.86-15.3,10.94-13.42,15.83" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M116.59,185.71c1.88,4.89,10.93,5.73,20.22,1.85s15.31-10.94,13.42-15.82S139.3,166,130,169.88s-15.31,10.94-13.42,15.83" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M152,185.71c1.89,4.89,10.94,5.73,20.25,1.85s15.3-10.94,13.42-15.82-10.95-5.73-20.24-1.86S150.11,180.82,152,185.71" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M10.34,159c1.88,4.88,10.94,5.7,20.23,1.83S45.87,149.89,44,145s-10.93-5.71-20.21-1.85S8.46,154.09,10.34,159" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M45.76,159c1.88,4.88,10.93,5.7,20.22,1.83S81.29,149.89,79.41,145s-10.94-5.71-20.24-1.85-15.29,11-13.41,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M81.17,159c1.89,4.88,10.93,5.7,20.23,1.83s15.3-10.93,13.42-15.83-10.95-5.71-20.23-1.85-15.3,11-13.42,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M116.59,159c1.88,4.88,10.93,5.7,20.22,1.83s15.31-10.93,13.42-15.83-10.93-5.71-20.22-1.85-15.31,11-13.42,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M152,159c1.89,4.88,10.94,5.7,20.25,1.83s15.3-10.93,13.42-15.83-10.95-5.71-20.24-1.85S150.11,154.09,152,159" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M10.34,132.22c1.88,4.9,10.94,5.73,20.23,1.87s15.3-11,13.41-15.84-10.93-5.73-20.21-1.87-15.31,11-13.43,15.84" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M45.76,132.22c1.88,4.9,10.93,5.73,20.22,1.87s15.31-11,13.43-15.84-10.94-5.73-20.24-1.87-15.29,11-13.41,15.84" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M81.17,132.22c1.89,4.9,10.93,5.73,20.23,1.87s15.3-11,13.42-15.84-10.95-5.73-20.23-1.87-15.3,11-13.42,15.84" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M116.59,132.22c1.88,4.9,10.93,5.73,20.22,1.87s15.31-11,13.42-15.84-10.93-5.73-20.22-1.87-15.31,11-13.42,15.84" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M152,132.22c1.89,4.9,10.94,5.73,20.25,1.87s15.3-11,13.42-15.84-10.95-5.73-20.24-1.87-15.31,11-13.43,15.84" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M10.34,105.5c1.88,4.87,10.94,5.7,20.23,1.84S45.87,96.39,44,91.5s-10.93-5.71-20.21-1.85-15.31,11-13.43,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M45.76,105.5c1.88,4.87,10.93,5.7,20.22,1.84s15.31-11,13.43-15.84-10.94-5.71-20.24-1.85-15.29,11-13.41,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M81.17,105.5c1.89,4.87,10.93,5.7,20.23,1.84s15.3-11,13.42-15.84-10.95-5.71-20.23-1.85-15.3,11-13.42,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M116.59,105.5c1.88,4.87,10.93,5.7,20.22,1.84s15.31-11,13.42-15.84S139.3,85.79,130,89.65s-15.31,11-13.42,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M152,105.5c1.89,4.87,10.94,5.7,20.25,1.84s15.3-11,13.42-15.84-10.95-5.71-20.24-1.85-15.31,11-13.43,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M116.59,25.26c1.89,4.9,10.93,5.73,20.23,1.86s15.29-11,13.41-15.82S139.29,5.57,130,9.42s-15.3,11-13.41,15.84" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M10.34,78.75c1.88,4.88,10.94,5.72,20.23,1.85s15.3-11,13.41-15.82S33.05,59,23.77,62.9s-15.31,11-13.43,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M45.76,78.75C47.64,83.63,56.69,84.47,66,80.6s15.31-11,13.43-15.82S68.47,59,59.17,62.9s-15.29,11-13.41,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M81.17,78.75c1.89,4.88,10.93,5.72,20.23,1.85s15.3-11,13.42-15.82S103.87,59,94.59,62.9s-15.3,11-13.42,15.85" transform="translate(-10 -7)"></path>
                            <path class="cls-1" d="M152,78.75c1.89,4.88,10.94,5.72,20.25,1.85s15.3-11,13.42-15.82S174.71,59,165.42,62.9s-15.31,11-13.43,15.85" transform="translate(-10 -7)"></path>
                        </svg>
                    </div>
                    <svg class="circular" viewBox="25 25 50 50">
                        <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></circle>
                    </svg>
                </div>
            </div>
        </div>
    </body>
</html>
