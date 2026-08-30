import { Link } from '@inertiajs/react';
import { useState, type SVGProps } from 'react';
import { AlertCircleIcon, ArrowLeftIcon, UserBadgeIcon } from '@Components/Common/Icons';
import { usuarios } from '@Utils/routes';
import pageStyles from './Page.module.css';
import styles from './NotFoundPanel.module.css';

/**
 * Un grano del isotipo. El logo es esta misma forma repetida en cuadrícula, así que
 * se dibuja una vez y se reutiliza con <use> en lugar de traer los 25 paths.
 */
const GRANO = 'M10.34,185.71c1.88,4.89,10.94,5.73,20.23,1.85s15.31-10.94,13.43-15.82S33.05,166,23.77,169.88,8.46,180.82,10.34,185.71Z';
const COLUMNAS = [0, 35.42, 70.83, 106.25, 141.66];
const FILAS = [0, -26.71, -53.49, -80.21, -106.96];
/** El logo deja este hueco en la última fila y coloca el grano suelto justo encima. */
const HUECO = { x: 106.25, y: -106.96 };
const SUELTO = { x: 106.25, y: -160.45 };

function IsotipoGranos(props: SVGProps<SVGSVGElement>) {
    return (
        <svg aria-hidden="true" focusable="false" viewBox="4 2 188 192" {...props}>
            <defs>
                <path d={GRANO} id="grano-404" />
            </defs>
            <g fill="currentColor">
                {FILAS.flatMap((y) => COLUMNAS.map((x) => (
                    x === HUECO.x && y === HUECO.y
                        ? null
                        : <use href="#grano-404" key={`${x}:${y}`} x={x} y={y} />
                )))}
                <use href="#grano-404" x={SUELTO.x} y={SUELTO.y} />
            </g>
        </svg>
    );
}

/**
 * Cuerpo de la página 404. Vive aparte de `Pages/NotFound` para poder probarlo sin
 * montar el layout, que necesita el contexto de Inertia.
 */
export function NotFoundPanel({ ruta }: { ruta?: string }) {
    // Llegar por un enlace externo o escribiendo la URL deja el historial vacío: ahí
    // "Volver atrás" no tendría a dónde ir, así que ni se pinta. Se calcula en el
    // primer render (no hay SSR) para no provocar un salto de layout al montar.
    const [puedeVolver] = useState(() => typeof window !== 'undefined' && window.history.length > 1);

    return (
        <section
            className={`${styles['not-found']} position-relative d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-4 gap-md-5 overflow-hidden rounded-4 bg-primary-subtle p-4 p-md-5`}
            data-not-found-panel
        >
            <p
                aria-hidden="true"
                className={`${styles['not-found__code']} m-0 flex-shrink-0 text-body-emphasis`}
            >
                404
            </p>

            <div className="position-relative z-1 flex-grow-1">
                <p
                    className={`${pageStyles['page-heading__eyebrow']} text-uppercase text-primary-emphasis`}
                >
                    Error 404
                </p>
                <h1 className={styles['not-found__title']}>Aquí no hay nada que mostrar</h1>
                <p className="mb-0 text-body-secondary">
                    La ruta que abriste no existe en el panel. Por ahora todo lo que administramos
                    vive en el listado de usuarios.
                </p>

                {ruta && (
                    <span className="mt-4 d-inline-flex mw-100 align-items-center gap-2 rounded-pill border bg-body-secondary px-3 py-2 small text-body-secondary">
                        <AlertCircleIcon aria-hidden="true" className="flex-shrink-0 text-primary" />
                        <span className="text-truncate font-monospace">{ruta}</span>
                    </span>
                )}

                <div className="mt-4 d-flex flex-column flex-md-row gap-2">
                    <Link
                        className={`${styles['not-found__action']} btn btn-primary d-inline-flex align-items-center justify-content-center`}
                        href={usuarios.index()}
                    >
                        <UserBadgeIcon aria-hidden="true" className="me-2" />Ir a Usuarios
                    </Link>
                    {puedeVolver && (
                        <button
                            className={`${styles['not-found__action']} btn btn-outline-secondary d-inline-flex align-items-center justify-content-center`}
                            onClick={() => window.history.back()}
                            type="button"
                        >
                            <ArrowLeftIcon aria-hidden="true" className="me-2" />Volver atrás
                        </button>
                    )}
                </div>
            </div>

            <IsotipoGranos className={`${styles['not-found__grain']} position-absolute`} />
        </section>
    );
}
