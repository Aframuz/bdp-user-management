import { Col, Row } from 'react-bootstrap';
import { AsyncSection } from '@Components/Common/AsyncSection';
import { StatusBadge } from '@Components/Common/StatusBadge';
import type { TabState } from '@Hooks/useLazyUserTabs';
import type { UsuarioGeneral } from '@Types/usuario';
import { formatDate } from '@Utils/date';

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
        <Row as="dl" className="m-0 g-4">
          {[
            ['Nombre', data.nombre],
            ['Apellido', data.apellido],
            ['Email', data.email],
            ['RUT/RUN', data.rut],
            ['Teléfono', data.telefono || 'No informado'],
            ['Rol', data.rol],
            ['Fecha de creación', formatDate(data.created_at)],
          ].map(([label, value]) => (
            <Col as="div" key={label} lg={4} md={6}>
              <dt className="mb-1 small text-uppercase text-body-secondary">{label}</dt>
              <dd className="m-0 fw-semibold text-break">{value}</dd>
            </Col>
          ))}
          <Col as="div" lg={4} md={6}>
            <dt className="mb-1 small text-uppercase text-body-secondary">Estado</dt>
            <dd className="m-0 fw-semibold">
              <StatusBadge estado={data.estado} />
            </dd>
          </Col>
        </Row>
      )}
    </AsyncSection>
  );
}
