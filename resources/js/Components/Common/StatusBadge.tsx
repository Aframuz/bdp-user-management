import { Badge } from 'react-bootstrap';
import styles from './StatusBadge.module.css';

export function StatusBadge({ estado }: { estado: string }) {
  const isActive = estado === 'activo';

  return (
    <Badge
      bg={isActive ? 'success' : 'secondary'}
      className={`${styles['status-badge']}${isActive ? '' : ` ${styles['status-badge--inactive']}`} d-inline-flex align-items-center gap-1 px-2 py-2 fw-semibold`}
    >
      <span aria-hidden="true" className={`${styles['status-badge__dot']} rounded-circle`} />
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  );
}
