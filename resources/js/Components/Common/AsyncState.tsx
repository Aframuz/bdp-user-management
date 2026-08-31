import type { ReactNode } from 'react';
import { Alert, Button, Placeholder } from 'react-bootstrap';
import { AlertTriangleIcon, InboxIcon } from './Icons';
import styles from './AsyncState.module.css';

/** Forma del esqueleto: imita el layout final para evitar saltos al resolver. */
export type SkeletonVariant = 'grid' | 'list' | 'table';

const SKELETON_ROWS: Record<SkeletonVariant, number[][]> = {
  grid: [
    [4, 4, 4],
    [4, 4, 4],
    [4, 4],
  ],
  list: [[12], [12]],
  table: [
    [7, 3],
    [9, 3],
    [6, 3],
    [8, 3],
  ],
};

export function LoadingState({
  label = 'Cargando información',
  variant = 'list',
}: {
  label?: string;
  variant?: SkeletonVariant;
}) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={`${styles['async-state']} p-4`}
      role="status"
    >
      <Placeholder animation="glow" as="div" aria-hidden="true">
        {SKELETON_ROWS[variant].map((row, rowIndex) => (
          <div className="mb-3 d-flex gap-4" key={rowIndex}>
            {row.map((size, cellIndex) => (
              <Placeholder
                className={`${styles['async-state__placeholder']} rounded`}
                key={cellIndex}
                xs={size}
              />
            ))}
          </div>
        ))}
      </Placeholder>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${styles['async-state']} d-flex flex-column align-items-center justify-content-center p-4 text-center text-body-secondary`}
      role="status"
    >
      <span
        aria-hidden="true"
        className={`${styles['async-state__icon']} mb-3 d-flex align-items-center justify-content-center rounded-circle border text-primary`}
      >
        <InboxIcon />
      </span>
      <p className="mb-0">{children}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="danger">
      <Alert.Heading as="h3" className="h6 d-flex align-items-center gap-2">
        <AlertTriangleIcon aria-hidden="true" /> No pudimos cargar la información
      </Alert.Heading>
      <p>{message}</p>
      <Button onClick={onRetry} size="sm" variant="outline-danger">
        Reintentar
      </Button>
    </Alert>
  );
}
