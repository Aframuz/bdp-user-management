import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormField } from '../../resources/js/Components/Common/FormField';
import { SelectField } from '../../resources/js/Components/Common/SelectField';
import { TextareaField } from '../../resources/js/Components/Common/TextareaField';

describe('field primitives', () => {
    it('links the error message to the control for every field type', () => {
        const { rerender } = render(
            <FormField error="Campo inválido." id="nombre" label="Nombre" onChange={vi.fn()} required value="" />,
        );

        const input = screen.getByLabelText(/Nombre/);
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('Campo inválido.');
        expect(input).toHaveAttribute('data-field', 'nombre');

        rerender(
            <SelectField error="Selecciona un rol." id="rol_id" label="Rol" onChange={vi.fn()}
                options={[{ value: '1', label: 'Admin' }]} placeholder="Selecciona" required value="" />,
        );
        expect(screen.getByLabelText(/Rol/)).toHaveAccessibleDescription('Selecciona un rol.');

        rerender(
            <TextareaField error="Escribe una nota." id="nota" label="Nota" onChange={vi.fn()} required value="" />,
        );
        expect(screen.getByLabelText(/Nota/)).toHaveAccessibleDescription('Escribe una nota.');
    });

    it('shows the hint only while there is no error', () => {
        const { rerender } = render(
            <FormField hint="Opcional." id="telefono" label="Teléfono" onChange={vi.fn()} value="" />,
        );
        expect(screen.getByLabelText('Teléfono')).toHaveAccessibleDescription('Opcional.');

        rerender(<FormField error="Solo números." hint="Opcional." id="telefono" label="Teléfono" onChange={vi.fn()} value="" />);
        expect(screen.getByLabelText('Teléfono')).toHaveAccessibleDescription('Solo números.');
    });

    it('renders the placeholder option and the provided choices', () => {
        render(
            <SelectField id="estado" label="Estado" onChange={vi.fn()}
                options={[{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }]}
                placeholder="Selecciona un estado" value="" />,
        );

        expect(screen.getAllByRole('option').map((option) => option.textContent))
            .toEqual(['Selecciona un estado', 'Activo', 'Inactivo']);
    });
});
