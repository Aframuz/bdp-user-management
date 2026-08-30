import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TelefonoField } from '@Components/Usuarios/TelefonoField';

/** El valor que viaja al backend no es el visible, sino el del campo oculto. */
const hiddenValue = (container: HTMLElement) =>
    container.querySelector<HTMLInputElement>('input[name="telefono"][type="hidden"]')?.value;

describe('TelefonoField', () => {
    it('starts on Chile in international format and submits only digits', async () => {
        const onValidChange = vi.fn();
        const { container } = render(<TelefonoField onValidChange={onValidChange} />);

        const input = screen.getByLabelText('Teléfono');
        expect(input).toHaveValue('+56');
        expect(screen.getByLabelText(/país/i)).toHaveValue('CL');

        await userEvent.type(input, '987654321');

        expect(input).toHaveValue('+56 9 8765 4321');
        expect(hiddenValue(container)).toBe('56987654321');
        expect(onValidChange).toHaveBeenLastCalledWith(true);
    });

    it('stays empty and valid while nothing is typed, because the field is optional', () => {
        const onValidChange = vi.fn();
        const { container } = render(<TelefonoField onValidChange={onValidChange} />);

        expect(hiddenValue(container)).toBe('');
        expect(onValidChange).toHaveBeenLastCalledWith(true);
    });

    it('warns about an incomplete number only after leaving the field', async () => {
        const onValidChange = vi.fn();
        render(<TelefonoField onValidChange={onValidChange} />);

        const input = screen.getByLabelText('Teléfono');
        await userEvent.type(input, '9123');
        expect(input).not.toHaveAccessibleDescription(/válido/);

        await userEvent.tab();
        expect(input).toHaveAccessibleDescription('Ingresa un teléfono válido para el país seleccionado.');
        expect(onValidChange).toHaveBeenLastCalledWith(false);
    });

    it('gives the form error priority over the local warning', () => {
        render(<TelefonoField error="El campo teléfono es obligatorio." onValidChange={vi.fn()} />);

        expect(screen.getByLabelText('Teléfono')).toHaveAccessibleDescription('El campo teléfono es obligatorio.');
    });
});
