import { describe, expect, it } from 'vitest';
import { getInputValidationProps, usuarioFormRules } from '@Hooks/usuarioFormRules';
import { validate, type ValidationRules } from '@Utils/validation';

interface Sample extends Record<string, string> {
  nombre: string;
  alias: string;
}

const rules: ValidationRules<Sample> = {
  nombre: { label: 'El nombre', required: true, maxLength: 5 },
  alias: { label: 'El alias', pattern: /^[a-z]+$/, patternMessage: 'Solo minúsculas.' },
};

describe('validate', () => {
  it('reports missing required fields and ignores empty optional ones', () => {
    expect(validate({ nombre: '   ', alias: '' }, rules)).toEqual({
      nombre: 'Este campo es obligatorio.',
    });
  });

  it('reports only the first failing rule per field', () => {
    expect(validate({ nombre: 'demasiado largo', alias: 'ok' }, rules)).toEqual({
      nombre: 'El nombre no puede superar 5 caracteres.',
    });
  });

  it('uses the custom message when a pattern fails', () => {
    expect(validate({ nombre: 'Ana', alias: 'NO' }, rules)).toEqual({ alias: 'Solo minúsculas.' });
  });

  it('trims before measuring length so whitespace is not counted', () => {
    expect(validate({ nombre: ' Ana ', alias: '' }, rules)).toEqual({});
  });
});

describe('usuarioFormRules', () => {
  it('mirrors the max lengths validated by StoreUsuarioRequest', () => {
    expect(usuarioFormRules.nombre?.maxLength).toBe(100);
    expect(usuarioFormRules.apellido?.maxLength).toBe(100);
    expect(usuarioFormRules.email?.maxLength).toBe(255);
    expect(usuarioFormRules.calle?.maxLength).toBe(255);
    expect(usuarioFormRules.ciudad?.maxLength).toBe(100);
    expect(usuarioFormRules.rut?.maxLength).toBe(30);
    expect(usuarioFormRules.codigo_postal?.maxLength).toBe(20);
    expect(usuarioFormRules.nota?.maxLength).toBe(1000);
  });

  it('marks every field the backend requires', () => {
    const required = Object.entries(usuarioFormRules)
      .filter(([, rule]) => rule?.required)
      .map(([field]) => field)
      .sort();

    expect(required).toEqual([
      'apellido',
      'calle',
      'ciudad',
      'email',
      'estado',
      'nombre',
      'nota',
      'rol_id',
      'rut',
    ]);
  });

  it('restricts names and cities to letters and postal codes to digits', () => {
    expect(usuarioFormRules.nombre?.pattern?.test('María José')).toBe(true);
    expect(usuarioFormRules.apellido?.pattern?.test('Soto3')).toBe(false);
    expect(usuarioFormRules.calle?.pattern).toBeUndefined();
    expect(usuarioFormRules.ciudad?.pattern?.test('Viña del Mar')).toBe(true);
    expect(usuarioFormRules.codigo_postal?.pattern?.test('7500000')).toBe(true);
    expect(usuarioFormRules.codigo_postal?.pattern?.test('75A0000')).toBe(false);
  });

  it('derives rendered input attributes from the shared rules', () => {
    expect(getInputValidationProps('nombre')).toEqual({
      maxLength: 100,
      pattern: usuarioFormRules.nombre?.pattern?.source,
      required: true,
    });
    expect(getInputValidationProps('calle')).toEqual({
      maxLength: 255,
      pattern: undefined,
      required: true,
    });
  });
});
