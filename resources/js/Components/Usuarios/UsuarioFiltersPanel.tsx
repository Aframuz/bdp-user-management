import { Button, Form, Offcanvas } from 'react-bootstrap';
import type { UsuarioFilters } from '../../Hooks/useUsuariosTable';
import type { RoleOption, SelectOption } from '../../Types/usuario';

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

export function UsuarioFiltersPanel({
    show, roles, estados, draft, onDraftChange, onApply, onClear, onHide,
}: UsuarioFiltersPanelProps) {
    return (
        <Offcanvas aria-labelledby="filters-title" onHide={onHide} placement="end" show={show}>
            <Offcanvas.Header closeButton closeLabel="Cerrar panel de filtros">
                <Offcanvas.Title as="h2" id="filters-title">Filtrar usuarios</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="d-flex flex-column">
                <Form.Group className="mb-4" controlId="filter-role">
                    <Form.Label>Rol</Form.Label>
                    <Form.Select onChange={(event) => onDraftChange({ ...draft, rol: event.target.value })} value={draft.rol}>
                        <option value="">Todos los roles</option>
                        {roles.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4" controlId="filter-state">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select onChange={(event) => onDraftChange({ ...draft, estado: event.target.value })} value={draft.estado}>
                        <option value="">Todos los estados</option>
                        {estados.map((estado) => <option key={estado.value} value={estado.value}>{estado.label}</option>)}
                    </Form.Select>
                </Form.Group>
                <div className="mt-auto d-grid gap-2">
                    <Button onClick={onApply}>Aplicar</Button>
                    <Button onClick={onClear} variant="outline-secondary">Limpiar</Button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
}
