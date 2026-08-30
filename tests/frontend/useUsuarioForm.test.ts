import { describe, expect, it } from 'vitest';
import { validateUsuarioForm } from '@Hooks/useUsuarioForm';
import type { UsuarioFormData } from '@Types/usuario';

const validForm: UsuarioFormData = {
    nombre: 'Camila', apellido: 'Soto', email: 'camila@example.test', rut: '11.111.111-1',
    telefono: '987654321', rol_id: '1', estado: 'activo', calle: 'Calle Uno', ciudad: 'Santiago',
    codigo_postal: '', nota: 'Observación',
};

describe('validateUsuarioForm', () => {
    it('accepts the complete required form', () => {
        expect(validateUsuarioForm(validForm)).toEqual({});
    });

    it('reports required, length, email and numeric errors', () => {
        const errors = validateUsuarioForm({
            ...validForm,
            nombre: '',
            apellido: 'a'.repeat(101),
            email: 'incorrecto',
            telefono: '+56 9',
            rol_id: '',
            nota: '',
        });

        expect(errors).toMatchObject({
            nombre: 'Este campo es obligatorio.',
            apellido: 'El apellido no puede superar 100 caracteres.',
            email: 'Ingresa un correo electrónico válido.',
            telefono: 'El teléfono solo puede contener números (entre 6 y 15 dígitos).',
            rol_id: 'Este campo es obligatorio.',
            nota: 'Este campo es obligatorio.',
        });
    });
});
