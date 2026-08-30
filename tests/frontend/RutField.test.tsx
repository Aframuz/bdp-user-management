import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RutField } from '@Components/Usuarios/RutField';

describe('RutField', () => {
    it('formats while typing and keeps the name the form submits', async () => {
        const onValidChange = vi.fn();
        render(<RutField onValidChange={onValidChange} />);

        const input = screen.getByLabelText(/RUT\/RUN/);
        expect(input).toHaveAttribute('name', 'rut');

        await userEvent.type(input, '111111111');

        expect(input).toHaveValue('11.111.111-1');
        expect(onValidChange).toHaveBeenLastCalledWith(true);
    });

    it('warns about an invalid check digit only after leaving the field', async () => {
        const onValidChange = vi.fn();
        render(<RutField onValidChange={onValidChange} />);

        const input = screen.getByLabelText(/RUT\/RUN/);
        await userEvent.type(input, '111111112');
        expect(input).not.toHaveAccessibleDescription(/no es válido/);

        await userEvent.tab();
        expect(input).toHaveAccessibleDescription('El RUT/RUN ingresado no es válido.');
        expect(onValidChange).toHaveBeenLastCalledWith(false);
    });

    it('gives the form error priority over the local warning', async () => {
        render(<RutField error="Este RUT/RUN ya está registrado." onValidChange={vi.fn()} />);

        const input = screen.getByLabelText(/RUT\/RUN/);
        await userEvent.type(input, '111111112');
        await userEvent.tab();

        expect(input).toHaveAccessibleDescription('Este RUT/RUN ya está registrado.');
    });
});
