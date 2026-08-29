import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DireccionesTab } from '../../resources/js/Components/Usuarios/Tabs/DireccionesTab';
import { GeneralTab } from '../../resources/js/Components/Usuarios/Tabs/GeneralTab';
import { NotasTab } from '../../resources/js/Components/Usuarios/Tabs/NotasTab';

describe('user detail tabs', () => {
    it('renders loading, empty and populated states', () => {
        const { rerender } = render(<NotasTab onRetry={vi.fn()} state={{ status: 'loading', data: null, error: null }} />);
        expect(screen.getByRole('status', { name: 'Cargando información' })).toHaveAttribute('aria-busy', 'true');

        rerender(<DireccionesTab onRetry={vi.fn()} state={{ status: 'success', data: [], error: null }} />);
        expect(screen.getByText(/no tiene una dirección/i)).toBeInTheDocument();

        rerender(<NotasTab onRetry={vi.fn()} state={{ status: 'success', data: [{ id: 1, texto: 'Nota visible', created_at: '2026-08-28T10:00:00Z' }], error: null }} />);
        expect(screen.getByText('Nota visible')).toBeInTheDocument();
    });

    it('renders backend errors and allows retry', () => {
        const retry = vi.fn();
        render(<GeneralTab onRetry={retry} state={{ status: 'error', data: null, error: 'Sin conexión' }} />);

        expect(screen.getByText('Sin conexión')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
        expect(retry).toHaveBeenCalledOnce();
    });
});
