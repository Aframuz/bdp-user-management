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

    it('rejects non-RUT characters and limits the raw value to nine characters', async () => {
        render(<RutField onValidChange={vi.fn()} />);

        const input = screen.getByLabelText(/RUT\/RUN/);
        await userEvent.type(input, '111a!111_1111');

        expect(input).toHaveValue('11.111.111-1');
    });

    it('allows K only as the final verifier while preserving its formatting', async () => {
        render(<RutField onValidChange={vi.fn()} />);

        const input = screen.getByLabelText(/RUT\/RUN/);
        await userEvent.type(input, '6532891k');

        expect(input).toHaveValue('6.532.891-k');

        await userEvent.type(input, 'a2');
        expect(input).toHaveValue('6.532.891-k');
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
