import { Head } from '@inertiajs/react';
import { NotFoundPanel } from '@Components/Common/NotFoundPanel';
import { AdminLayout } from '@Layouts/AdminLayout';
import type { SharedPageProps } from '@Types/inertia';

interface NotFoundProps extends SharedPageProps {
    /** Ruta pedida, tal como llegó al servidor. */
    ruta?: string;
}

export default function NotFound({ ruta }: NotFoundProps) {
    return (
        <AdminLayout centered>
            <Head title="Página no encontrada" />
            <NotFoundPanel ruta={ruta} />
        </AdminLayout>
    );
}
