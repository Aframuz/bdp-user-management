import { Badge } from 'react-bootstrap';

export function StatusBadge({ estado }: { estado: string }) {
    const isActive = estado === 'activo';

    return (
        <Badge
            bg={isActive ? 'success' : 'secondary'}
            className={`status-badge${isActive ? '' : ' status-badge--inactive'}`}
        >
            <span aria-hidden="true" className="status-dot" />
            {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
    );
}
