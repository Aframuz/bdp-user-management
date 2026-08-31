import { createInertiaApp } from '@inertiajs/react';
import { formatTitle } from '@Utils/meta';
import { resolvePage } from '@Utils/pageModules';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

createInertiaApp({
  title: formatTitle,
  // Las visitas GET cambian de página con una transición breve. Los prefetch y
  // las mutaciones quedan fuera: deben calentar la caché o actualizar sin animar.
  defaults: {
    visitOptions: (_href, options) => ({
      viewTransition: !options.prefetch && (options.method ?? 'get') === 'get',
    }),
  },
  resolve: resolvePage,
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: {
    color: '#62ab52',
    showSpinner: false,
  },
});
