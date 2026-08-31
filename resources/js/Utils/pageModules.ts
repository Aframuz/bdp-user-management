import type { ResolvedComponent } from '@inertiajs/react';

type PageModule = { default: ResolvedComponent };

const pageModules = import.meta.glob<PageModule>('../Pages/**/*.tsx');

function pageLoader(name: string) {
  const loader = pageModules[`../Pages/${name}.tsx`];

  if (!loader) {
    return Promise.reject(new Error(`No existe la página de Inertia "${name}".`));
  }

  return loader();
}

/** Resuelve el componente que Inertia debe pintar sin cargar por adelantado las demás páginas. */
export function resolvePage(name: string): Promise<ResolvedComponent> {
  return pageLoader(name).then((module) => module.default);
}

/** Inicia la descarga del chunk de una página; es especulativa y nunca bloquea la navegación real. */
export function preloadPage(name: string): Promise<void> {
  return pageLoader(name).then(
    () => undefined,
    () => undefined,
  );
}

/**
 * Calienta una ruta probable una vez que el navegador queda libre. El fallback mantiene
 * compatibilidad con navegadores sin requestIdleCallback.
 */
export function preloadPageWhenIdle(name: string): () => void {
  if (typeof window === 'undefined') return () => undefined;

  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(() => void preloadPage(name), { timeout: 1500 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = globalThis.setTimeout(() => void preloadPage(name), 200);
  return () => globalThis.clearTimeout(timeoutId);
}
