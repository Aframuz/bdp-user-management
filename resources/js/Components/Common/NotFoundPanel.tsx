import { Link } from '@inertiajs/react';
import { useState, type SVGProps } from 'react';
import { AlertCircleIcon, ArrowLeftIcon, UserBadgeIcon } from '@Components/Common/Icons';
import { usuarios } from '@Utils/routes';

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
        <section className="error-page">
            <p aria-hidden="true" className="error-page__code">404</p>

            <div className="error-page__body">
                <p className="eyebrow">Error 404</p>
                <h1>Aquí no hay nada que mostrar</h1>
                <p>
                    La ruta que abriste no existe en el panel. Por ahora todo lo que administramos
                    vive en el listado de usuarios.
                </p>

                {ruta && (
                    <span className="route-chip">
                        <AlertCircleIcon aria-hidden="true" />
                        <span className="route-chip__path">{ruta}</span>
                    </span>
                )}

                <div className="error-page__actions">
                    <Link className="btn btn-primary" href={usuarios.index()}>
                        <UserBadgeIcon aria-hidden="true" className="me-2" />Ir a Usuarios
                    </Link>
                    {puedeVolver && (
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => window.history.back()}
                            type="button"
                        >
                            <ArrowLeftIcon aria-hidden="true" className="me-2" />Volver atrás
                        </button>
                    )}
                </div>
            </div>

            <IsotipoGranos className="error-page__grain" />
        </section>
    );
}
