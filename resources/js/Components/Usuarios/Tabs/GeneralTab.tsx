import { Col, Row } from 'react-bootstrap';
import type { TabState } from '../../../Hooks/useLazyUserTabs';
import type { UsuarioGeneral } from '../../../Types/usuario';
import { formatDate } from '../../../Utils/date';
import { AsyncSection } from '../../Common/AsyncSection';
import { StatusBadge } from '../../Common/StatusBadge';

export function GeneralTab({ state, onRetry }: { state: TabState<UsuarioGeneral>; onRetry: () => void }) {
    return (
        <AsyncSection
            emptyMessage="No hay información general disponible."
            onRetry={onRetry}
            skeleton="grid"
            state={state}
        >
            {(data) => (
                <Row as="dl" className="detail-grid g-4">
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
                            <dt>{label}</dt><dd>{value}</dd>
                        </Col>
                    ))}
                    <Col as="div" lg={4} md={6}>
                        <dt>Estado</dt><dd><StatusBadge estado={data.estado} /></dd>
                    </Col>
                </Row>
            )}
        </AsyncSection>
    );
}
