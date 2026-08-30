import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs } from '@Components/Common/Breadcrumbs';

describe('Breadcrumbs', () => {
    it('links the intermediate crumbs and marks the last one as current', () => {
        render(<Breadcrumbs items={[{ label: 'Usuarios', href: '/usuarios' }, { label: 'Registrar' }]} />);

        expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute('href', '/usuarios');
        expect(screen.queryByRole('link', { name: 'Registrar' })).not.toBeInTheDocument();
        expect(screen.getByText('Registrar')).toHaveAttribute('aria-current', 'page');
    });

    it('never links the last crumb even when it carries an href', () => {
        render(<Breadcrumbs items={[{ label: 'Usuarios', href: '/usuarios' }, { label: 'Ana', href: '/usuarios/1' }]} />);

        expect(screen.queryByRole('link', { name: 'Ana' })).not.toBeInTheDocument();
    });
});
