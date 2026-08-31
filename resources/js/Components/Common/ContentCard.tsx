import type { ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import styles from './Page.module.css';

/** Tarjeta de contenido con su encabezado: el envoltorio que repiten las secciones del mantenedor. */
export function ContentCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card className="mb-4 overflow-hidden rounded-4 border shadow">
      <Card.Body className={styles['content-card__body']}>
        <h2 className="mb-4 border-bottom pb-3 fs-5 fw-bold">{title}</h2>
        {children}
      </Card.Body>
    </Card>
  );
}
