import type { Form } from '@inertiajs/react';
import { useCallback, useRef, type ComponentRef, type SyntheticEvent } from 'react';
import type { UsuarioFormData } from '@Types/usuario';
import { validate } from '@Utils/validation';
import { usuarioFormRules } from './usuarioFormRules';

type UsuarioFormRef = ComponentRef<typeof Form<UsuarioFormData>>;

export const RUT_INVALIDO = 'El RUT/RUN ingresado no es válido.';

export function validateUsuarioForm(data: UsuarioFormData): Record<string, string> {
    return validate(data, usuarioFormRules);
}

/** Lleva el foco al primer campo con error para no obligar a buscarlo a mano. */
export function focusFirstError(errors: Record<string, string>): void {
    const firstField = Object.keys(errors)[0];
    if (!firstField) return;
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-field="${firstField}"]`)?.focus());
}

/**
 * Cableado del `<Form>` de Inertia: los campos son no controlados y el componente
 * lee sus valores del DOM, así que aquí solo queda la validación previa al envío.
 */
export function useUsuarioForm() {
    const formRef = useRef<UsuarioFormRef>(null);
    /** El dígito verificador lo calcula `RutField`; aquí solo se recuerda para frenar el envío. */
    const rutValidoRef = useRef(false);
    const setRutValido = useCallback((valido: boolean) => { rutValidoRef.current = valido; }, []);

    /** Se ejecuta en `onBefore`: devolver `false` cancela la petición y deja los errores en pantalla. */
    const validateBeforeSubmit = (): boolean => {
        const form = formRef.current;
        if (!form) return true;

        const errors = validateUsuarioForm(form.getData());
        if (!errors.rut && !rutValidoRef.current) errors.rut = RUT_INVALIDO;
        if (Object.keys(errors).length === 0) return true;

        form.setError(errors);
        focusFirstError(errors);
        return false;
    };

    /** Limpia el error del campo que el usuario acaba de corregir; el evento llega delegado desde el control. */
    const clearFieldError = (event: SyntheticEvent<HTMLFormElement>) => {
        const { name } = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (name) formRef.current?.clearErrors(name);
    };

    return { formRef, validateBeforeSubmit, clearFieldError, setRutValido };
}
