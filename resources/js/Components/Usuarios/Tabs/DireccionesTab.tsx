import { GeoAlt } from 'react-bootstrap-icons';
import type { TabState } from '../../../Hooks/useLazyUserTabs';
import type { Direccion } from '../../../Types/usuario';
import { AsyncSection } from '../../Common/AsyncSection';

export function DireccionesTab({ state, onRetry }: { state: TabState<Direccion[]>; onRetry: () => void }) {
    return (
        <AsyncSection
            emptyMessage="Este usuario no tiene una dirección registrada."
            onRetry={onRetry}
            skeleton="list"
            state={state}
        >
            {(direcciones) => (
                <div className="address-list">
                    {direcciones.map((direccion) => (
                        <article className="address-card" key={direccion.id}>
                            <h3><GeoAlt aria-hidden="true" className="me-2" />{direccion.calle}</h3>
                            <p className="mb-1">{direccion.ciudad}</p>
                            <p className="text-secondary mb-0">
                                Código postal: {direccion.codigo_postal || 'No informado'}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </AsyncSection>
    );
}
