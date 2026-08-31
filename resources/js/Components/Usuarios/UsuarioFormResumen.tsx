import { Link } from '@inertiajs/react';
import { Button, Card, ProgressBar } from 'react-bootstrap';
import { AlertCircleIcon, CircleCheckIcon } from '@Components/Common/Icons';
import { focusField } from '@Hooks/useUsuarioForm';
import type { EstadoSeccion, UsuarioFormProgreso } from '@Hooks/useUsuarioFormProgreso';
import { preloadPage } from '@Utils/pageModules';
import { usuarios } from '@Utils/routes';
import pageStyles from '@Components/Common/Page.module.css';
import styles from './UsuarioFormResumen.module.css';

interface UsuarioFormResumenProps {
  progreso: UsuarioFormProgreso;
  processing: boolean;
}

/** El icono acompaña al texto del estado; nunca es el único que lo cuenta. */
function MarcaSeccion({ estado }: { estado: EstadoSeccion }) {
  const className = `${styles['form-summary__marca']} ${styles[`form-summary__marca--${estado}`]}`;

  if (estado === 'completa') {
    return <CircleCheckIcon aria-hidden="true" className={className} />;
  }

  if (estado === 'error') {
    return <AlertCircleIcon aria-hidden="true" className={className} />;
  }

  return <span aria-hidden="true" className={className} />;
}

/**
 * Resumen del formulario de registro: cuánto queda por rellenar, en qué estado está
 * cada tarjeta, los campos que hay que corregir y las dos acciones.
 *
 * Es un único bloque para las dos disposiciones que pide el diseño —columna pegajosa
 * en escritorio, barra fija al pie en móvil—, así que el botón de guardar existe una
 * sola vez en el DOM y el foco y los lectores de pantalla ven un solo formulario.
 */
export function UsuarioFormResumen({ progreso, processing }: UsuarioFormResumenProps) {
  const conErrores = progreso.errores.length > 0;

  return (
    <aside aria-labelledby="form-summary-title" className={styles['form-summary']}>
      <Card className={`${styles['form-summary__card']} overflow-hidden rounded-4 border shadow`}>
        <Card.Body className={styles['form-summary__body']}>
          <div className={styles['form-summary__progreso']}>
            <p
              className={`${pageStyles['page-heading__eyebrow']} d-none text-uppercase text-primary d-lg-block`}
              id="form-summary-title"
            >
              Resumen
            </p>
            <p className={`${styles['form-summary__conteo']} mb-2 fw-bold`}>
              {conErrores
                ? `${progreso.errores.length === 1 ? '1 campo' : `${progreso.errores.length} campos`} con error`
                : `${progreso.completos} de ${progreso.total} campos`}
              {/* En la barra del pie no cabe la frase entera y el contexto ya la explica. */}
              {!conErrores && <span className="d-none d-lg-inline"> completos</span>}
            </p>
            <ProgressBar
              aria-hidden="true"
              className={styles['form-summary__barra']}
              now={progreso.porcentaje}
              variant={conErrores ? 'danger' : 'success'}
            />
          </div>

          {conErrores && (
            <ul className="d-none list-unstyled mb-0 mt-3 d-lg-block">
              {progreso.errores.map(({ campo, label }) => (
                <li key={campo}>
                  <button
                    className={`${styles['form-summary__error-link']} small`}
                    onClick={() => focusField(campo)}
                    type="button"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <ul className="d-none list-unstyled my-3 border-top border-bottom d-lg-block">
            {progreso.secciones.map((seccion) => (
              <li className={styles['form-summary__seccion']} key={seccion.id}>
                <MarcaSeccion estado={seccion.estado} />
                <span className="flex-fill text-truncate small fw-bold">{seccion.titulo}</span>
                <span
                  className={`flex-shrink-0 small ${seccion.estado === 'error' ? 'text-danger' : 'text-body-secondary'}`}
                >
                  {seccion.detalle}
                </span>
              </li>
            ))}
          </ul>

          <div className={styles['form-summary__acciones']}>
            <Button disabled={processing} type="submit">
              {processing ? 'Guardando…' : 'Guardar usuario'}
            </Button>
            <Link
              className="btn btn-outline-secondary"
              href={usuarios.index()}
              onFocus={() => void preloadPage('Usuarios/Index')}
              onPointerEnter={() => void preloadPage('Usuarios/Index')}
              prefetch="hover"
            >
              Cancelar
            </Link>
          </div>

          <p className="d-none mb-0 mt-3 small text-body-secondary d-lg-block">
            Los campos con <span className="text-danger">*</span> son obligatorios.
          </p>
        </Card.Body>
      </Card>
    </aside>
  );
}
