export interface FieldRule {
    label: string;
    required?: boolean;
    maxLength?: number;
    pattern?: RegExp;
    /** Mensaje usado cuando falla `pattern`. */
    patternMessage?: string;
}

export type ValidationRules<T> = Partial<Record<keyof T, FieldRule>>;

/**
 * Valida un objeto plano contra un mapa de reglas y devuelve el primer error por campo,
 * en el mismo formato `{ campo: mensaje }` que usan los errores de Inertia.
 */
export function validate<T extends Record<string, string>>(
    data: T,
    rules: ValidationRules<T>,
): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(rules) as Array<[string, FieldRule]>) {
        const value = String(data[field] ?? '').trim();

        if (rule.required && value === '') {
            errors[field] = 'Este campo es obligatorio.';
            continue;
        }

        if (value === '') continue;

        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            errors[field] = `${rule.label} no puede superar ${rule.maxLength} caracteres.`;
            continue;
        }

        if (rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.patternMessage ?? `${rule.label} no tiene un formato válido.`;
        }
    }

    return errors;
}
