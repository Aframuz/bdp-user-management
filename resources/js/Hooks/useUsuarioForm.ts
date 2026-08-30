import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { UsuarioFormData } from '@Types/usuario';
import { usuarios } from '@Utils/routes';
import { validate } from '@Utils/validation';
import { usuarioFormRules } from './usuarioFormRules';

const initialData: UsuarioFormData = {
    nombre: '',
    apellido: '',
    email: '',
    rut: '',
    telefono: '',
    rol_id: '',
    estado: '',
    calle: '',
    ciudad: '',
    codigo_postal: '',
    nota: '',
};

export function validateUsuarioForm(data: UsuarioFormData): Record<string, string> {
    return validate(data, usuarioFormRules);
}

/** Lleva el foco al primer campo con error para no obligar a buscarlo a mano. */
function focusFirstError(errors: Record<string, string>): void {
    const firstField = Object.keys(errors)[0];
    if (!firstField) return;
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-field="${firstField}"]`)?.focus());
}

export function useUsuarioForm() {
    const form = useForm<UsuarioFormData>(initialData);

    const setField = (field: keyof UsuarioFormData, value: string) => {
        form.setData(field as string, value);
        form.clearErrors(field as string);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.clearErrors();
        const clientErrors = validateUsuarioForm(form.data);

        if (Object.keys(clientErrors).length > 0) {
            form.setError(clientErrors);
            focusFirstError(clientErrors);
            return;
        }

        form.post(usuarios.index(), {
            preserveScroll: true,
            onError: (errors) => focusFirstError(errors as Record<string, string>),
        });
    };

    return { ...form, setField, submit };
}
