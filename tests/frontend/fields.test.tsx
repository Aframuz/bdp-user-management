import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from '@Components/Common/FormField';
import { SelectField } from '@Components/Common/SelectField';
import { TextareaField } from '@Components/Common/TextareaField';

describe('field primitives', () => {
    it('links the error message to the control for every field type', () => {
        const { rerender } = render(
            <FormField error="Campo inválido." id="nombre" label="Nombre" required />,
        );

        const input = screen.getByLabelText(/Nombre/);
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('Campo inválido.');
        expect(input).toHaveAttribute('data-field', 'nombre');
        expect(input).toHaveAttribute('name', 'nombre');

        rerender(
            <SelectField error="Selecciona un rol." id="rol_id" label="Rol"
                options={[{ value: '1', label: 'Admin' }]} placeholder="Selecciona" required />,
        );
        expect(screen.getByLabelText(/Rol/)).toHaveAccessibleDescription('Selecciona un rol.');

        rerender(
            <TextareaField error="Escribe una nota." id="nota" label="Nota" required />,
        );
        expect(screen.getByLabelText(/Nota/)).toHaveAccessibleDescription('Escribe una nota.');
    });

    it('shows the hint only while there is no error', () => {
        const { rerender } = render(
            <FormField hint="Opcional." id="telefono" label="Teléfono" />,
        );
        expect(screen.getByLabelText('Teléfono')).toHaveAccessibleDescription('Opcional.');

        rerender(<FormField error="Solo números." hint="Opcional." id="telefono" label="Teléfono" />);
        expect(screen.getByLabelText('Teléfono')).toHaveAccessibleDescription('Solo números.');
    });

    it('renders the placeholder option and the provided choices', () => {
        render(
            <SelectField id="estado" label="Estado"
                options={[{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }]}
                placeholder="Selecciona un estado" />,
        );

        expect(screen.getAllByRole('option').map((option) => option.textContent))
            .toEqual(['Selecciona un estado', 'Activo', 'Inactivo']);
    });
});
