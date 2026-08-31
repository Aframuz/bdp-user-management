import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Breadcrumbs } from '@Components/Common/Breadcrumbs';
import { PageMeta } from '@Components/Common/PageMeta';
import { UsuarioFichaCabecera } from '@Components/Usuarios/UsuarioFichaCabecera';
import { UsuarioFichaTabs } from '@Components/Usuarios/UsuarioFichaTabs';
import { useLazyUserTabs } from '@Hooks/useLazyUserTabs';
import { AdminLayout } from '@Layouts/AdminLayout';
import type { SharedPageProps } from '@Types/inertia';
import { USER_TABS, type UserTab, type UsuarioSummary } from '@Types/usuario';
import { usuarios } from '@Utils/routes';
import pageStyles from '@Components/Common/Page.module.css';

interface ShowProps extends SharedPageProps {
  usuario: UsuarioSummary;
}

const isUserTab = (key: string | null): key is UserTab =>
  key !== null && (USER_TABS as readonly string[]).includes(key);

export default function Show({ usuario }: ShowProps) {
  const [activeTab, setActiveTab] = useState<UserTab>('general');
  const { states, load, retry } = useLazyUserTabs(usuario.id);

  // El tab activo al entrar también se carga bajo demanda, no viene en las props.
  useEffect(() => {
    void load('general');
  }, [load]);

  const selectTab = (key: string | null) => {
    if (!isUserTab(key)) return;
    setActiveTab(key);
    void load(key);
  };

  return (
    <AdminLayout>
      <PageMeta
        description={`Ficha de ${usuario.nombre_completo}: datos generales, direcciones registradas y notas internas.`}
        title={usuario.nombre_completo}
      />
      <Breadcrumbs
        items={[{ label: 'Usuarios', href: usuarios.index() }, { label: usuario.nombre_completo }]}
      />

      {/* La ficha entera es una sola tarjeta: identidad arriba y, a partir de `lg`,
          navegación a la izquierda con el contenido al lado. */}
      <Card className="overflow-hidden rounded-4 border shadow">
        <Card.Body className={pageStyles['content-card__body']}>
          <UsuarioFichaCabecera usuario={usuario} />
          <UsuarioFichaTabs
            activeTab={activeTab}
            onRetry={(tab) => void retry(tab)}
            onSelect={selectTab}
            states={states}
          />
        </Card.Body>
      </Card>
    </AdminLayout>
  );
}
