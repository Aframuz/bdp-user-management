import { Table } from 'react-bootstrap';
import { AsyncSection } from '@Components/Common/AsyncSection';
import type { TabState } from '@Hooks/useLazyUserTabs';
import type { Nota } from '@Types/usuario';
import { formatDate } from '@Utils/date';

export function NotasTab({ state, onRetry }: { state: TabState<Nota[]>; onRetry: () => void }) {
  return (
    <AsyncSection
      emptyMessage="Este usuario no tiene notas registradas."
      onRetry={onRetry}
      skeleton="table"
      state={state}
    >
      {(notas) => (
        <div className="table-responsive">
          <Table hover>
            <caption className="visually-hidden">
              Notas y observaciones registradas para el usuario
            </caption>
            <thead>
              <tr>
                <th>Nota u observación</th>
                <th>Fecha de creación</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((nota) => (
                <tr key={nota.id}>
                  <td>{nota.texto}</td>
                  <td>{formatDate(nota.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </AsyncSection>
  );
}
