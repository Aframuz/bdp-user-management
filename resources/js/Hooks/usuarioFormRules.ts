import type { UsuarioFormData } from '../Types/usuario';
import type { ValidationRules } from '../Utils/validation';

/**
 * Espejo de App\Http\Requests\StoreUsuarioRequest::rules().
 * Mantener ambos lados alineados: el backend sigue siendo la autoridad,
 * esto solo evita un viaje al servidor para errores evidentes.
 */
export const usuarioFormRules: ValidationRules<UsuarioFormData> = {
    nombre: { label: 'El nombre', required: true, maxLength: 100 },
    apellido: { label: 'El apellido', required: true, maxLength: 100 },
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
    calle: { label: 'La calle', required: true, maxLength: 255 },
    ciudad: { label: 'La ciudad', required: true, maxLength: 100 },
    codigo_postal: { label: 'El código postal', maxLength: 20 },
    nota: { label: 'La nota', required: true, maxLength: 1000 },
};
