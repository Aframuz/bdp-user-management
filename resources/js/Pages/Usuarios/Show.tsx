import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { Breadcrumbs } from '@Components/Common/Breadcrumbs';
import { ArrowLeftIcon } from '@Components/Common/Icons';
import pageStyles from '@Components/Common/Page.module.css';
import { PageMeta } from '@Components/Common/PageMeta';
import { StatusBadge } from '@Components/Common/StatusBadge';
import { DireccionesTab } from '@Components/Usuarios/Tabs/DireccionesTab';
import { GeneralTab } from '@Components/Usuarios/Tabs/GeneralTab';
import { NotasTab } from '@Components/Usuarios/Tabs/NotasTab';
import { useLazyUserTabs } from '@Hooks/useLazyUserTabs';
import { AdminLayout } from '@Layouts/AdminLayout';
import type { SharedPageProps } from '@Types/inertia';
import { USER_TABS, type UserTab, type UsuarioSummary } from '@Types/usuario';
import { preloadPage } from '@Utils/pageModules';
import { usuarios } from '@Utils/routes';
import styles from './Show.module.css';

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
            <PageMeta
                description={`Ficha de ${usuario.nombre_completo}: datos generales, direcciones registradas y notas internas.`}
                title={usuario.nombre_completo}
            />
            <Breadcrumbs items={[{ label: 'Usuarios', href: usuarios.index() }, { label: usuario.nombre_completo }]} />
            <div
                className={`${pageStyles['page-heading']} d-flex flex-column flex-md-row align-items-stretch align-items-md-end justify-content-between gap-4`}
            >
                <div>
                    <p className={`${pageStyles['page-heading__eyebrow']} text-uppercase text-primary`}>Ficha de usuario</p>
                    <h1 className={pageStyles['page-heading__title']}>{usuario.nombre_completo}</h1>
                </div>
                <Link
                    className="btn btn-outline-secondary"
                    href={usuarios.index()}
                    onFocus={() => void preloadPage('Usuarios/Index')}
                    onPointerEnter={() => void preloadPage('Usuarios/Index')}
                    prefetch="hover"
                >
                    <ArrowLeftIcon aria-hidden="true" className="me-2" />Volver al listado
                </Link>
            </div>

            <Card className="mb-4 overflow-hidden rounded-4 border shadow">
                <Card.Body className="d-flex align-items-start align-items-md-center gap-3 p-4">
                    <div
                        aria-hidden="true"
                        className={`${styles['user-profile__avatar']} d-flex flex-shrink-0 align-items-center justify-content-center rounded-4 border fw-bold`}
                    >
                        {usuario.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="mb-1 fs-5 fw-bold">{usuario.nombre_completo}</h2>
                        <p className="mb-2 text-body-secondary">{usuario.email}</p>
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge rounded-pill bg-primary-subtle px-2 py-2 fw-bold text-primary-emphasis">
                                {usuario.rol}
                            </span>
                            <StatusBadge estado={usuario.estado} />
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className={`${styles['user-detail']} overflow-hidden rounded-4 border shadow`}>
                <Card.Body className={`${pageStyles['content-card__body']} pt-3`}>
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
