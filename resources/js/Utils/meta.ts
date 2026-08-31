/** Nombre comercial del sitio; se usa en `og:site_name` y en los títulos. */
export const SITE_NAME = 'Bolsa de Productos';

/** Título por defecto cuando una página no aporta el suyo. */
export const DEFAULT_TITLE = 'Mantenedor de Usuarios';

/**
 * Formatea el título del documento. Vive aquí y no en `app.tsx` porque el
 * callback `title` de Inertia solo alcanza al <title>: `og:title` y
 * `twitter:title` son metas normales y tienen que componerse a mano con la
 * misma regla para no divergir.
 */
export const formatTitle = (title?: string): string =>
  title ? `${title} · Mantenedor` : DEFAULT_TITLE;

/**
 * Convierte la ruta de Inertia (`usePage().url`, siempre relativa) en la URL
 * absoluta que piden `canonical` y `og:url`. Sin `window` —build de SSR— se
 * devuelve la ruta tal cual: es lo único cierto que tenemos.
 */
export function absoluteUrl(path: string): string {
  if (typeof window === 'undefined') {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}
