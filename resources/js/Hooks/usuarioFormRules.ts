import type { UsuarioFormData } from '@Types/usuario';
import type { ValidationRules } from '@Utils/validation';
import type { UsuarioCampo } from './usuarioFormSecciones';

export const SOLO_LETRAS_Y_ESPACIOS = /^[\p{L}\p{M} ]+$/u;
export const SOLO_DIGITOS = /^\d+$/;

const MENSAJE_SOLO_LETRAS = 'Solo se permiten letras y espacios.';

/**
 * Espejo de App\Http\Requests\StoreUsuarioRequest::rules().
 * Mantener ambos lados alineados: el backend sigue siendo la autoridad,
 * esto solo evita un viaje al servidor para errores evidentes.
 */
export const usuarioFormRules: ValidationRules<UsuarioFormData> = {
  nombre: {
    label: 'El nombre',
    required: true,
    maxLength: 100,
    pattern: SOLO_LETRAS_Y_ESPACIOS,
    patternMessage: MENSAJE_SOLO_LETRAS,
  },
  apellido: {
    label: 'El apellido',
    required: true,
    maxLength: 100,
    pattern: SOLO_LETRAS_Y_ESPACIOS,
    patternMessage: MENSAJE_SOLO_LETRAS,
  },
  email: {
    label: 'El email',
    required: true,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Ingresa un correo electrónico válido.',
  },
  rut: { label: 'El RUT/RUN', required: true, maxLength: 30 },
  telefono: {
    label: 'El teléfono',
    maxLength: 15,
    pattern: /^\d{6,15}$/,
    patternMessage: 'El teléfono solo puede contener números (entre 6 y 15 dígitos).',
  },
  rol_id: { label: 'El rol', required: true },
  estado: { label: 'El estado', required: true },
  calle: {
    label: 'La calle',
    required: true,
    maxLength: 255,
  },
  ciudad: {
    label: 'La ciudad',
    required: true,
    maxLength: 100,
    pattern: SOLO_LETRAS_Y_ESPACIOS,
    patternMessage: MENSAJE_SOLO_LETRAS,
  },
  codigo_postal: {
    label: 'El código postal',
    maxLength: 20,
    pattern: SOLO_DIGITOS,
    patternMessage: 'El código postal solo puede contener números.',
  },
  nota: { label: 'La nota', required: true, maxLength: 1000 },
};

/**
 * Atributos compartidos por inputs, selects y textareas. El esquema es la única
 * fuente frontend de `required` y `maxLength`; los componentes solo lo proyectan
 * al control que renderizan.
 */
export function getFieldValidationProps(campo: UsuarioCampo) {
  const rule = usuarioFormRules[campo];

  return {
    maxLength: rule?.maxLength,
    required: rule?.required,
  };
}

/** Añade el patrón HTML cuando el campo tiene uno en el esquema. */
export function getInputValidationProps(campo: UsuarioCampo) {
  const rule = usuarioFormRules[campo];

  return {
    ...getFieldValidationProps(campo),
    pattern: rule?.pattern?.source,
  };
}

/** Hace visible un límite que `maxlength` aplicaría silenciosamente. */
export function getMaxLengthHint(campo: UsuarioCampo): string | undefined {
  const maxLength = usuarioFormRules[campo]?.maxLength;

  return maxLength === undefined ? undefined : `Máximo ${maxLength} caracteres.`;
}
