import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useUsuarioForm, validateUsuarioForm } from '@Hooks/useUsuarioForm';
import type { UsuarioFormData } from '@Types/usuario';

const validForm: UsuarioFormData = {
  nombre: 'Camila',
  apellido: 'Soto',
  email: 'camila@example.test',
  rut: '11.111.111-1',
  telefono: '987654321',
  rol_id: '1',
  estado: 'activo',
  calle: 'Calle Uno 123',
  ciudad: 'Santiago',
  codigo_postal: '',
  nota: 'Observación',
};

describe('validateUsuarioForm', () => {
  it('accepts the complete required form', () => {
    expect(validateUsuarioForm(validForm)).toEqual({});
  });

  it('reports required, length, email and numeric errors', () => {
    const errors = validateUsuarioForm({
      ...validForm,
      nombre: '',
      apellido: '',
      email: 'incorrecto',
      telefono: '+56 9',
      rol_id: '',
      nota: '',
    });

    expect(errors).toMatchObject({
      nombre: 'Este campo es obligatorio.',
      apellido: 'Este campo es obligatorio.',
      email: 'Ingresa un correo electrónico válido.',
      telefono: 'El teléfono solo puede contener números (entre 6 y 15 dígitos).',
      rol_id: 'Este campo es obligatorio.',
      nota: 'Este campo es obligatorio.',
    });
  });

  it('accepts values exactly at their documented limits', () => {
    expect(
      validateUsuarioForm({
        ...validForm,
        nombre: 'a'.repeat(100),
        apellido: 'a'.repeat(100),
        nota: 'a'.repeat(1000),
      }),
    ).toEqual({});
  });

  it('rejects names and notes that exceed their documented limits', () => {
    expect(
      validateUsuarioForm({
        ...validForm,
        nombre: 'a'.repeat(101),
        apellido: 'a'.repeat(101),
        nota: 'a'.repeat(1001),
      }),
    ).toMatchObject({
      nombre: 'El nombre no puede superar 100 caracteres.',
      apellido: 'El apellido no puede superar 100 caracteres.',
      nota: 'La nota no puede superar 1000 caracteres.',
    });
  });

  it('reports non-letter names and cities and a non-numeric postal code', () => {
    const errors = validateUsuarioForm({
      ...validForm,
      nombre: 'Camila3',
      apellido: 'Soto!',
      ciudad: 'Santiago_1',
      codigo_postal: '7500A00',
    });

    expect(errors).toMatchObject({
      nombre: 'Solo se permiten letras, espacios, guiones y apóstrofos.',
      apellido: 'Solo se permiten letras, espacios, guiones y apóstrofos.',
      ciudad: 'Solo se permiten letras, espacios, guiones y apóstrofos.',
      codigo_postal: 'El código postal solo puede contener números.',
    });
  });

  it('accepts real names with apostrophes, hyphens and periods', () => {
    expect(
      validateUsuarioForm({
        ...validForm,
        nombre: 'Ana María',
        apellido: "O'Higgins-García",
        ciudad: 'St. John',
      }),
    ).toEqual({});
  });

  it('rejects a name that starts with a separator', () => {
    expect(validateUsuarioForm({ ...validForm, apellido: "-Soto" })).toMatchObject({
      apellido: 'Solo se permiten letras, espacios, guiones y apóstrofos.',
    });
  });
});

describe('useUsuarioForm', () => {
  it('cancels the Inertia visit and sets inline errors for overlong names', () => {
    const setError = vi.fn();
    const { result } = renderHook(() => useUsuarioForm());

    Object.defineProperty(result.current.formRef, 'current', {
      configurable: true,
      value: {
        getData: () => ({
          ...validForm,
          nombre: 'a'.repeat(101),
          apellido: 'a'.repeat(101),
        }),
        setError,
      },
    });

    expect(result.current.validateBeforeSubmit()).toBe(false);
    expect(setError).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'El nombre no puede superar 100 caracteres.',
        apellido: 'El apellido no puede superar 100 caracteres.',
      }),
    );
  });
});
