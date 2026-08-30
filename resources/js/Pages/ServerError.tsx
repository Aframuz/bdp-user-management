import { ServerErrorPanel } from '@Components/Common/ServerErrorPanel';
import { PageMeta } from '@Components/Common/PageMeta';
import { AdminLayout } from '@Layouts/AdminLayout';
import type { SharedPageProps } from '@Types/inertia';

interface ServerErrorProps extends SharedPageProps {
    /** Ruta pedida, sin información interna de la excepción. */
    ruta?: string;
}

export default function ServerError({ ruta }: ServerErrorProps) {
    return (
        <AdminLayout centered>
            <PageMeta
                description="No pudimos procesar la solicitud por un problema inesperado. Vuelve al listado de usuarios e inténtalo nuevamente."
                title="Error interno"
            />
            <ServerErrorPanel ruta={ruta} />
        </AdminLayout>
    );
}
