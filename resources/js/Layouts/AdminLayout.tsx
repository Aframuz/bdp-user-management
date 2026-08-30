import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import logoToolbar from '@Assets/logo-toolbar.svg';
import { MoonIcon, SunIcon } from '@Components/Common/Icons';
import type { SharedPageProps } from '@Types/inertia';
import { usuarios } from '@Utils/routes';
import styles from './AdminLayout.module.css';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bolsa-productos-theme';

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    try {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
    } catch {
        // El almacenamiento puede estar deshabilitado; la preferencia del sistema sigue disponible.
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AdminLayout({ centered = false, children }: { centered?: boolean; children: ReactNode }) {
    const { flash } = usePage<SharedPageProps>().props;
    const message = flash?.success ?? flash?.error;
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    // Se descarta por id y no por texto: dos flashes iguales seguidos deben mostrarse ambos.
    const [dismissedId, setDismissedId] = useState<string | null>(null);
    const showToast = Boolean(message && dismissedId !== flash?.id);
    const nextTheme = theme === 'light' ? 'dark' : 'light';

    useEffect(() => {
        document.documentElement.dataset.bsTheme = theme;
        document.documentElement.style.colorScheme = theme;

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // El tema sigue funcionando durante la sesión aunque no pueda persistirse.
        }
    }, [theme]);

    return (
        <div className="min-vh-100">
            <a
                className={`${styles['admin-layout__skip-link']} visually-hidden-focusable position-fixed top-0 start-0 m-3 rounded bg-dark p-3 text-white text-decoration-none`}
                href="#main-content"
            >
                Saltar al contenido principal
            </a>
            <header
                className={`${styles['admin-layout__header']} sticky-top border-bottom border-dark border-opacity-25 shadow-sm`}
            >
                <Container className="d-flex align-items-center justify-content-between py-3">
                    <Link
                        aria-label="Ir al inicio de Bolsa de Productos"
                        className="d-inline-flex align-items-center gap-3 text-white text-decoration-none"
                        href={usuarios.index()}
                    >
                        <span
                            aria-hidden="true"
                            className={`${styles['admin-layout__brand-mark']} d-block flex-shrink-0 overflow-hidden`}
                        >
                            <img
                                alt=""
                                className={`${styles['admin-layout__brand-logo']} d-block`}
                                src={logoToolbar}
                            />
                        </span>
                        <span>
                            <strong className="d-block lh-sm">Bolsa de Productos</strong>
                            <small
                                className={`${styles['admin-layout__brand-subtitle']} mt-1 d-block lh-sm text-white`}
                            >
                                Panel de administración
                            </small>
                        </span>
                    </Link>
                    <button
                        aria-label={`Activar tema ${nextTheme === 'dark' ? 'oscuro' : 'claro'}`}
                        aria-pressed={theme === 'dark'}
                        className={`${styles['admin-layout__theme-toggle']} btn btn-outline-light d-inline-flex flex-shrink-0 align-items-center justify-content-center rounded-circle p-0`}
                        onClick={() => setTheme(nextTheme)}
                        title={`Activar tema ${nextTheme === 'dark' ? 'oscuro' : 'claro'}`}
                        type="button"
                    >
                        {theme === 'light' ? <MoonIcon aria-hidden="true" /> : <SunIcon aria-hidden="true" />}
                    </button>
                </Container>
            </header>
            <main
                className={`${styles['admin-layout__content']}${centered ? ' d-flex align-items-center' : ''}`}
                id="main-content"
                tabIndex={-1}
            >
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
