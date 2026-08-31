import { AsyncSection } from '@Components/Common/AsyncSection';
import { MapPinIcon } from '@Components/Common/Icons';
import type { TabState } from '@Hooks/useLazyUserTabs';
import type { Direccion } from '@Types/usuario';

export function DireccionesTab({
  state,
  onRetry,
}: {
  state: TabState<Direccion[]>;
  onRetry: () => void;
}) {
  return (
    <AsyncSection
      emptyMessage="Este usuario no tiene una dirección registrada."
      onRetry={onRetry}
      skeleton="list"
      state={state}
    >
      {(direcciones) => (
        <div className="d-grid gap-3">
          {direcciones.map((direccion) => (
            <article className="rounded-3 border bg-body-tertiary p-4" key={direccion.id}>
              <h3 className="d-flex align-items-center fs-6 fw-bold">
                <MapPinIcon aria-hidden="true" className="me-2" />
                {direccion.calle}
              </h3>
              <p className="mb-1">{direccion.ciudad}</p>
              <p className="text-body-secondary mb-0">
                Código postal: {direccion.codigo_postal || 'No informado'}
              </p>
            </article>
          ))}
        </div>
      )}
    </AsyncSection>
  );
}
