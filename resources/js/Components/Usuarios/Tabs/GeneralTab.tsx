import { AsyncSection } from '@Components/Common/AsyncSection';
import { StatusBadge } from '@Components/Common/StatusBadge';
import type { TabState } from '@Hooks/useLazyUserTabs';
import type { UsuarioGeneral } from '@Types/usuario';
import { formatDate } from '@Utils/date';
import styles from './GeneralTab.module.css';

export function GeneralTab({
  state,
  onRetry,
}: {
  state: TabState<UsuarioGeneral>;
  onRetry: () => void;
}) {
  return (
    <AsyncSection
      emptyMessage="No hay información general disponible."
      onRetry={onRetry}
      skeleton="grid"
      state={state}
    >
      {(data) => (
        <dl className={styles['general-grid']}>
          {[
            ['Nombre', data.nombre],
            ['Apellido', data.apellido],
            ['Email', data.email],
            ['RUT/RUN', data.rut],
            ['Teléfono', data.telefono || 'No informado'],
            ['Rol', data.rol],
            ['Fecha de creación', formatDate(data.created_at)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="mb-1 small text-uppercase text-body-secondary">{label}</dt>
              <dd className={`${styles['general-grid__value']} fw-semibold`}>{value}</dd>
            </div>
          ))}
          <div>
            <dt className="mb-1 small text-uppercase text-body-secondary">Estado</dt>
            <dd className={`${styles['general-grid__value']} fw-semibold`}>
              <StatusBadge estado={data.estado} />
            </dd>
          </div>
        </dl>
      )}
    </AsyncSection>
  );
}
