import { Link, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { PersonBadgeFill } from 'react-bootstrap-icons';
import type { SharedPageProps } from '../Types/inertia';
import { usuarios } from '../Utils/routes';

export function AdminLayout({ children }: { children: ReactNode }) {
    const { flash } = usePage<SharedPageProps>().props;
    const message = flash?.success ?? flash?.error;
    // Se descarta por id y no por texto: dos flashes iguales seguidos deben mostrarse ambos.
    const [dismissedId, setDismissedId] = useState<string | null>(null);
    const showToast = Boolean(message && dismissedId !== flash?.id);

    return (
        <div className="app-shell">
            <header className="app-header">
                <Container className="d-flex align-items-center justify-content-between py-3">
                    <Link aria-label="Ir al listado de usuarios" className="brand" href={usuarios.index()}>
                        <span aria-hidden="true" className="brand__mark"><PersonBadgeFill /></span>
                        <span>
                            <strong>Usuarios</strong>
                            <small>Panel de administración</small>
                        </span>
                    </Link>
                    <span className="environment-label">Gestión interna</span>
                </Container>
            </header>
            <main className="page-content" id="main-content" tabIndex={-1}>
                <Container>{children}</Container>
            </main>
            {message && (
                <ToastContainer className="p-3" position="top-end">
                    <Toast
                        autohide
                        bg={flash.success ? 'success' : 'danger'}
                        delay={4500}
                        onClose={() => setDismissedId(flash?.id ?? null)}
                        show={showToast}
                    >
                        <Toast.Header closeButton closeLabel="Cerrar notificación">
                            <strong className="me-auto">{flash.success ? 'Operación exitosa' : 'Ocurrió un error'}</strong>
                        </Toast.Header>
                        <Toast.Body className="text-white" role="status" aria-live="polite">{message}</Toast.Body>
                    </Toast>
                </ToastContainer>
            )}
        </div>
    );
}
