import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { UsuarioExportMenu } from '../../resources/js/Components/Usuarios/UsuarioExportMenu';

describe('UsuarioExportMenu', () => {
    it('offers an unfiltered export and one with the currently applied filters', async () => {
        const user = userEvent.setup();
        render(
            <UsuarioExportMenu
                filters={{ rol: '3', estado: 'activo' }}
                search="Ana Demo"
            />,
        );

        const toggle = screen.getByRole('button', { name: 'Exportar a csv' });
        expect(toggle).toHaveClass('dropdown-toggle');

        await user.click(toggle);

        expect(screen.getByRole('link', { name: 'Todos los usuarios' }))
            .toHaveAttribute('href', '/usuarios/export');
        expect(screen.getByRole('link', { name: 'Solo filtrados' }))
            .toHaveAttribute('href', '/usuarios/export?search=Ana+Demo&rol=3&estado=activo');
    });

    it('omits empty filters from the export URL', async () => {
        const user = userEvent.setup();
        render(<UsuarioExportMenu filters={{ rol: '', estado: '' }} search="" />);

        await user.click(screen.getByRole('button', { name: 'Exportar a csv' }));

        expect(screen.getByRole('link', { name: 'Solo filtrados' }))
            .toHaveAttribute('href', '/usuarios/export');
    });
});
