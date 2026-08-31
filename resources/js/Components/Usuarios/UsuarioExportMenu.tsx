import { Dropdown } from 'react-bootstrap';
import { DownloadIcon } from '@Components/Common/Icons';
import type { UsuarioFilters } from '@Hooks/useUsuariosTable';
import { usuarios } from '@Utils/routes';

interface UsuarioExportMenuProps {
  search: string;
  filters: UsuarioFilters;
}

export function UsuarioExportMenu({ search, filters }: UsuarioExportMenuProps) {
  const filteredUrl = usuarios.exportCsv({
    search,
    rol: filters.rol,
    estado: filters.estado,
  });

  return (
    <Dropdown align="end">
      <Dropdown.Toggle id="users-export-menu" variant="outline-primary">
        <DownloadIcon aria-hidden="true" className="me-2" />
        Exportar a csv
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item href={usuarios.exportCsv()}>Todos los usuarios</Dropdown.Item>
        <Dropdown.Item href={filteredUrl}>Solo filtrados</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
