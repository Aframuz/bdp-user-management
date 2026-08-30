import { ErrorPanel } from '@Components/Common/ErrorPanel';

/**
 * Cuerpo de la página 404. Vive aparte de `Pages/NotFound` para poder probarlo sin
 * montar el layout, que necesita el contexto de Inertia.
 */
export function NotFoundPanel({ ruta }: { ruta?: string }) {
    return (
        <ErrorPanel
            code="404"
            description="La ruta que abriste no existe en el panel. Por ahora todo lo que administramos vive en el listado de usuarios."
            ruta={ruta}
            title="Aquí no hay nada que mostrar"
        />
    );
}
