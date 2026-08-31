import { Link } from '@inertiajs/react';
import { ArrowLeftIcon } from '@Components/Common/Icons';
import { StatusBadge } from '@Components/Common/StatusBadge';
import type { UsuarioSummary } from '@Types/usuario';
import { preloadPage } from '@Utils/pageModules';
import { usuarios } from '@Utils/routes';
import pageStyles from '@Components/Common/Page.module.css';
import styles from './UsuarioFichaCabecera.module.css';

/**
 * Identidad de la ficha: nombre, rol, estado y correo, más la vuelta al listado.
 *
 * Los chips van debajo del nombre y no a su lado: compartiendo fila con un título
 * que puede ocupar varias líneas acababan colgando al final de la última, en
 * cualquier sitio. El detalle de cómo aguanta un valor al tope está en el CSS.
 */
export function UsuarioFichaCabecera({ usuario }: { usuario: UsuarioSummary }) {
  return (
    <div className={styles['ficha-header']}>
      <div className={styles['ficha-header__identity']}>
        <p className={`${pageStyles['page-heading__eyebrow']} text-uppercase text-primary`}>
          Ficha de usuario
        </p>
        <h1
          className={`${pageStyles['page-heading__title']} ${styles['ficha-header__title']} mb-3`}
        >
          {usuario.nombre_completo}
        </h1>
        <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
          <span className="badge rounded-pill bg-primary-subtle px-2 py-2 fw-bold text-primary-emphasis">
            {usuario.rol}
          </span>
          <StatusBadge estado={usuario.estado} />
        </div>
        <p className={`${styles['ficha-header__email']} mb-0 text-body-secondary`}>
          {usuario.email}
        </p>
      </div>
      <Link
        className={`${styles['ficha-header__back']} btn btn-outline-secondary`}
        href={usuarios.index()}
        onFocus={() => void preloadPage('Usuarios/Index')}
        onPointerEnter={() => void preloadPage('Usuarios/Index')}
        prefetch="hover"
      >
        <ArrowLeftIcon aria-hidden="true" className="me-2" />
        Volver al listado
      </Link>
    </div>
  );
}
