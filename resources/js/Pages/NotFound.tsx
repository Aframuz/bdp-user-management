import { NotFoundPanel } from '@Components/Common/NotFoundPanel';
import { PageMeta } from '@Components/Common/PageMeta';
import { AdminLayout } from '@Layouts/AdminLayout';
import type { SharedPageProps } from '@Types/inertia';

interface NotFoundProps extends SharedPageProps {
  /** Ruta pedida, tal como llegó al servidor. */
  ruta?: string;
}

export default function NotFound({ ruta }: NotFoundProps) {
  return (
    <AdminLayout centered>
      <PageMeta
        description="La dirección solicitada no existe o fue movida. Vuelve al listado de usuarios del mantenedor."
        title="Página no encontrada"
      />
      <NotFoundPanel ruta={ruta} />
    </AdminLayout>
  );
}
