import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '@Components/Common/ConfirmDialog';

const setup = (overrides = {}) => {
    const props = {
        show: true,
        title: 'Eliminar usuario',
        confirmLabel: 'Eliminar',
        pendingLabel: 'Eliminando…',
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        ...overrides,
    };

    render(<ConfirmDialog {...props}>¿Confirmas la acción?</ConfirmDialog>);

    return props;
};

describe('ConfirmDialog', () => {
    it('asks for confirmation before running the action', () => {
        const { onConfirm, onCancel } = setup();

        expect(screen.getByRole('dialog', { name: 'Eliminar usuario' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(onCancel).toHaveBeenCalledOnce();
        expect(onConfirm).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
        expect(onConfirm).toHaveBeenCalledOnce();
    });

    it('blocks both actions and shows progress while pending', () => {
        setup({ pending: true });

        expect(screen.getByRole('button', { name: 'Eliminando…' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });

    it('contains long unbreakable names instead of letting them overflow', () => {
        const longName = 'A'.repeat(200);

        render(
            <ConfirmDialog
                confirmLabel="Eliminar"
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
                show
                title="Eliminar usuario"
            >
                ¿Confirmas que deseas eliminar a <strong>{longName}</strong>?
            </ConfirmDialog>,
        );

        expect(screen.getByText(longName).closest('.modal-body')).toHaveClass('text-break');
    });
});
