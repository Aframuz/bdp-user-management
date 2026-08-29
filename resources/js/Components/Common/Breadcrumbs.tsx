import { Link } from '@inertiajs/react';
import { Breadcrumb } from 'react-bootstrap';

export interface Crumb {
    label: string;
    /** Sin href, la miga se marca como página actual. */
    href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
        <Breadcrumb className="app-breadcrumbs" listProps={{ className: 'mb-0' }}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                // `href` va en el propio Item: BreadcrumbItem lo aplica DESPUÉS de
                // `linkProps`, así que pasarlo solo ahí lo dejaría sin destino.
                return item.href && !isLast ? (
                    <Breadcrumb.Item href={item.href} key={item.label} linkAs={Link}>
                        {item.label}
                    </Breadcrumb.Item>
                ) : (
                    <Breadcrumb.Item active key={item.label}>{item.label}</Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
}
