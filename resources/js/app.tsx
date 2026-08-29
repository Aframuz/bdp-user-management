import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

createInertiaApp({
    title: (title) => (title ? `${title} · Mantenedor` : 'Mantenedor de Usuarios'),
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
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#3454d1',
        showSpinner: false,
    },
});
