import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { Breadcrumbs } from '../../Components/Common/Breadcrumbs';
import { ArrowLeftIcon } from '../../Components/Common/Icons';
import { StatusBadge } from '../../Components/Common/StatusBadge';
import { DireccionesTab } from '../../Components/Usuarios/Tabs/DireccionesTab';
import { GeneralTab } from '../../Components/Usuarios/Tabs/GeneralTab';
import { NotasTab } from '../../Components/Usuarios/Tabs/NotasTab';
import { useLazyUserTabs } from '../../Hooks/useLazyUserTabs';
import { AdminLayout } from '../../Layouts/AdminLayout';
import type { SharedPageProps } from '../../Types/inertia';
import { USER_TABS, type UserTab, type UsuarioSummary } from '../../Types/usuario';
import { usuarios } from '../../Utils/routes';

interface ShowProps extends SharedPageProps {
    usuario: UsuarioSummary;
}

const isUserTab = (key: string | null): key is UserTab =>
    key !== null && (USER_TABS as readonly string[]).includes(key);

export default function Show({ usuario }: ShowProps) {
    const [activeTab, setActiveTab] = useState<UserTab>('general');
    const { states, load, retry } = useLazyUserTabs(usuario.id);

    // El tab activo al entrar también se carga bajo demanda, no viene en las props.
    useEffect(() => { void load('general'); }, [load]);

    const selectTab = (key: string | null) => {
        if (!isUserTab(key)) return;
        setActiveTab(key);
        void load(key);
    };

    return (
        <AdminLayout>
            <Head title={usuario.nombre_completo} />
            <Breadcrumbs items={[{ label: 'Usuarios', href: usuarios.index() }, { label: usuario.nombre_completo }]} />
            <div className="page-heading page-heading--actions">
                <div>
                    <p className="eyebrow">Ficha de usuario</p>
                    <h1>{usuario.nombre_completo}</h1>
                </div>
                <Link className="btn btn-outline-secondary" href={usuarios.index()}>
                    <ArrowLeftIcon aria-hidden="true" className="me-2" />Volver al listado
                </Link>
            </div>

            <Card className="profile-summary mb-4">
                <Card.Body>
                    <div aria-hidden="true" className="profile-avatar">
                        {usuario.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-summary__body">
                        <h2>{usuario.nombre_completo}</h2>
                        <p>{usuario.email}</p>
                        <div className="d-flex align-items-center gap-2">
                            <span className="role-pill">{usuario.rol}</span>
                            <StatusBadge estado={usuario.estado} />
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="content-card detail-tabs">
                <Card.Body>
                    <Tabs activeKey={activeTab} mountOnEnter onSelect={selectTab}>
                        <Tab eventKey="general" title="Información general">
                            <GeneralTab onRetry={() => void retry('general')} state={states.general} />
                        </Tab>
                        <Tab eventKey="direcciones" title="Direcciones">
                            <DireccionesTab onRetry={() => void retry('direcciones')} state={states.direcciones} />
                        </Tab>
                        <Tab eventKey="notas" title="Notas">
                            <NotasTab onRetry={() => void retry('notas')} state={states.notas} />
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </AdminLayout>
    );
}
