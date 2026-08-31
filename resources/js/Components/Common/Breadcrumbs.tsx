import { Link } from '@inertiajs/react';
import { Breadcrumb } from 'react-bootstrap';
import styles from './Breadcrumbs.module.css';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumb className={`${styles.breadcrumbs} small mb-3`} listProps={{ className: 'mb-0' }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return item.href && !isLast ? (
          <Breadcrumb.Item href={item.href} key={item.label} linkAs={Link}>
            {item.label}
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item active key={item.label}>
            {item.label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}
