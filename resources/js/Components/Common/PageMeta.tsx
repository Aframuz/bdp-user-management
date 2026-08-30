import { Head, usePage } from '@inertiajs/react';
import { SITE_NAME, absoluteUrl, formatTitle } from '@Utils/meta';

interface PageMetaProps {
    /** Título de la página, sin el sufijo del sitio: lo agrega `formatTitle`. */
    title: string;
    /** Resumen de una o dos frases para buscadores y para la tarjeta al compartir. */
    description: string;
}

/**
 * Cabecera común de todas las páginas: título, descripción y tarjetas
 * Open Graph / Twitter. Inertia reemplaza estas etiquetas en cada visita,
 * así que la descripción acompaña siempre a la página que se está viendo.
 *
 * Las etiquetas que nunca cambian (favicon, charset, theme-color) siguen en
 * `app.blade.php`: están disponibles en el primer pintado, antes de que monte
 * React.
 */
export function PageMeta({ title, description }: PageMetaProps) {
    const url = absoluteUrl(usePage().url);
    const fullTitle = formatTitle(title);

    return (
        <Head title={title}>
            <meta content={description} head-key="description" name="description" />
            {/* Panel interno de administración: no debe aparecer en buscadores. */}
            <meta content="noindex, nofollow" head-key="robots" name="robots" />
            <meta content={SITE_NAME} head-key="application-name" name="application-name" />
            <link head-key="canonical" href={url} rel="canonical" />

            <meta content="website" head-key="og:type" property="og:type" />
            <meta content={SITE_NAME} head-key="og:site_name" property="og:site_name" />
            <meta content="es_CL" head-key="og:locale" property="og:locale" />
            <meta content={fullTitle} head-key="og:title" property="og:title" />
            <meta content={description} head-key="og:description" property="og:description" />
            <meta content={url} head-key="og:url" property="og:url" />

            <meta content="summary" head-key="twitter:card" name="twitter:card" />
            <meta content={fullTitle} head-key="twitter:title" name="twitter:title" />
            <meta content={description} head-key="twitter:description" name="twitter:description" />
        </Head>
    );
}
