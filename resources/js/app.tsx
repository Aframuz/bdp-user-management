import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { formatTitle } from '@Utils/meta';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-phone-number-input/style.css';
import './app.css';

createInertiaApp({
    title: formatTitle,
    // Inertia envuelve su swap de componente en document.startViewTransition() cuando
    // la visita lleva `viewTransition`. Se activa para todas menos los prefetch, que
    // solo llenan la caché y no pintan nada. No sirve mirar `options.viewTransition`
    // para dejar que cada visita mande: <Link> lo manda siempre explícito en `false`
    // por ser una prop con default, así que nunca llega `undefined` y no se distingue
    // un opt-out real. El contrapeso es que `<Link viewTransition={false}>` no puede
    // desactivarlas; para excluir una visita hay que filtrarla por `href` aquí.
    defaults: {
        visitOptions: (_href, options) => ({ viewTransition: !options.prefetch }),
    },
    // Inertia 3 estrechó el tipo de `resolve`: ya no admite `Promise<{ default }>`,
    // solo el componente. En runtime sigue haciendo `module.default || module`, pero
    // desenvolvemos aquí para que el tipo cuadre sin castear.
    resolve: (name) =>
        resolvePageComponent<{ default: ResolvedComponent }>(
            `./Pages/${name}.tsx`,
            import.meta.glob<{ default: ResolvedComponent }>('./Pages/**/*.tsx'),
        ).then((module) => module.default),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#62ab52',
        showSpinner: false,
    },
});
