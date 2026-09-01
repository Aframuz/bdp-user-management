import type { UsuarioFormData } from '@Types/usuario';
import type { ValidationRules } from '@Utils/validation';
import type { UsuarioCampo } from './usuarioFormSecciones';

/**
 * Nombres propios: letras (con sus marcas diacríticas) más los separadores que
 * aparecen en apellidos reales —O'Higgins, García-López, St. John—. El primer
 * carácter debe ser una letra para que el campo no empiece por un separador.
 */
export const NOMBRE_PROPIO = /^[\p{L}\p{M}][\p{L}\p{M}'’.\- ]*$/u;
export const SOLO_DIGITOS = /^\d+$/;

const MENSAJE_NOMBRE_PROPIO = 'Solo se permiten letras, espacios, guiones y apóstrofos.';

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
    pattern: NOMBRE_PROPIO,
    patternMessage: MENSAJE_NOMBRE_PROPIO,
  },
  apellido: {
    label: 'El apellido',
    required: true,
    maxLength: 100,
    pattern: NOMBRE_PROPIO,
    patternMessage: MENSAJE_NOMBRE_PROPIO,
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
    pattern: NOMBRE_PROPIO,
    patternMessage: MENSAJE_NOMBRE_PROPIO,
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
