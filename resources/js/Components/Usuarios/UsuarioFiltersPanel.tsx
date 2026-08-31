import { Button, Form, Offcanvas } from 'react-bootstrap';
import { CircleCheckIcon, UserBadgeIcon } from '@Components/Common/Icons';
import formStyles from '@Components/Common/FormControls.module.css';
import styles from './UsuarioFiltersPanel.module.css';
import type { UsuarioFilters } from '@Hooks/useUsuariosTable';
import type { RoleOption, SelectOption } from '@Types/usuario';

interface UsuarioFiltersPanelProps {
  show: boolean;
  roles: RoleOption[];
  estados: SelectOption[];
  draft: UsuarioFilters;
  onDraftChange: (draft: UsuarioFilters) => void;
  onApply: () => void;
  onClear: () => void;
  onHide: () => void;
}

/**
 * Resume el borrador en una frase. El panel distingue entre lo escogido y lo
 * aplicado, así que conviene decir qué se va a aplicar antes de pulsar el botón.
 */
function describeDraft(draft: UsuarioFilters): string {
  const selected = [draft.rol, draft.estado].filter(Boolean).length;

  if (selected === 0) {
    return 'Ningún filtro seleccionado';
  }

  return selected === 1 ? '1 filtro seleccionado' : `${selected} filtros seleccionados`;
}

export function UsuarioFiltersPanel({
  show,
  roles,
  estados,
  draft,
  onDraftChange,
  onApply,
  onClear,
  onHide,
}: UsuarioFiltersPanelProps) {
  return (
    <Offcanvas aria-labelledby="filters-title" onHide={onHide} placement="end" show={show}>
      <Offcanvas.Header
        className={styles['filters-panel__header']}
        closeButton
        closeLabel="Cerrar panel de filtros"
        closeVariant="white"
      >
        <div className={styles['filters-panel__heading']}>
          <p className={styles['filters-panel__eyebrow']}>Refinar listado</p>
          <Offcanvas.Title as="h2" className={styles['filters-panel__title']} id="filters-title">
            Filtrar usuarios
          </Offcanvas.Title>
          <p className={styles['filters-panel__subtitle']}>
            Ajusta el padrón sin salir del listado.
          </p>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body className={styles['filters-panel__body']}>
        <Form.Group className={styles['filters-panel__card']} controlId="filter-role">
          <div className={styles['filters-panel__card-label']}>
            <span aria-hidden="true" className={styles['filters-panel__icon']}>
              <UserBadgeIcon />
            </span>
            <Form.Label className={styles['filters-panel__label']}>Rol</Form.Label>
          </div>
          <Form.Select
            className={formStyles['form-control']}
            onChange={(event) => onDraftChange({ ...draft, rol: event.target.value })}
            value={draft.rol}
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className={styles['filters-panel__card']} controlId="filter-state">
          <div className={styles['filters-panel__card-label']}>
            <span aria-hidden="true" className={styles['filters-panel__icon']}>
              <CircleCheckIcon />
            </span>
            <Form.Label className={styles['filters-panel__label']}>Estado</Form.Label>
          </div>
          <Form.Select
            className={formStyles['form-control']}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                estado: event.target.value,
              })
            }
            value={draft.estado}
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Offcanvas.Body>
      <div className={styles['filters-panel__footer']}>
        <p aria-live="polite" className={styles['filters-panel__summary']}>
          {describeDraft(draft)}
        </p>
        <div className="d-grid gap-2">
          <Button onClick={onApply}>Aplicar</Button>
          <Button onClick={onClear} variant="outline-secondary">
            Limpiar
          </Button>
        </div>
      </div>
    </Offcanvas>
  );
}
