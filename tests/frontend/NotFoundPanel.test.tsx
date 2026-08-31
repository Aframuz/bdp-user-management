import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NotFoundPanel } from '@Components/Common/NotFoundPanel';

describe('NotFoundPanel', () => {
    it('explains the error and offers the only available section', () => {
        render(<NotFoundPanel ruta="/informes/2024" />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aquí no hay nada que mostrar');
        expect(screen.getByRole('link', { name: 'Ir a Usuarios' })).toHaveAttribute('href', '/usuarios');
        expect(screen.getByText('/informes/2024')).toBeInTheDocument();
    });

    it('omits the route chip when the server did not send one', () => {
        render(<NotFoundPanel />);

        expect(screen.getByRole('link', { name: 'Ir a Usuarios' })).toBeInTheDocument();
        expect(screen.queryByText('/informes/2024')).not.toBeInTheDocument();
    });

    it('hides the back button when there is nowhere to go back to', () => {
        // jsdom arranca con una sola entrada de historial, igual que una pestaña que
        // abre la URL rota directamente.
        render(<NotFoundPanel ruta="/informes/2024" />);

        expect(screen.queryByRole('button', { name: 'Volver atrás' })).not.toBeInTheDocument();
    });

    it('goes back through the browser history when there is a previous page', async () => {
        vi.spyOn(window.history, 'length', 'get').mockReturnValue(3);
        const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

        render(<NotFoundPanel ruta="/informes/2024" />);
        await userEvent.click(screen.getByRole('button', { name: 'Volver atrás' }));

        expect(back).toHaveBeenCalledOnce();
        vi.restoreAllMocks();
    });
});
