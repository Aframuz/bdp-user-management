import type { Form } from '@inertiajs/react';
import { useCallback, useRef, type ComponentRef, type SyntheticEvent } from 'react';
import type { UsuarioFormData } from '@Types/usuario';
import { validate } from '@Utils/validation';
import { usuarioFormRules } from './usuarioFormRules';

type UsuarioFormRef = ComponentRef<typeof Form<UsuarioFormData>>;

export const RUT_INVALIDO = 'El RUT/RUN ingresado no es válido.';
export const TELEFONO_INVALIDO = 'Ingresa un teléfono válido para el país seleccionado.';

/**
 * Campos que se validan solos: el componente sabe si su valor cuadra (dígito verificador,
 * numeración del país) y el hook guarda qué decir cuando no, para frenar el envío.
 * Los mismos textos y los mismos criterios viven en `App\Rules\RutValido` y
 * `App\Rules\TelefonoValido`, que son la autoridad.
 */
const MENSAJES_POR_CAMPO = { rut: RUT_INVALIDO, telefono: TELEFONO_INVALIDO } as const;

type CampoAutovalidado = keyof typeof MENSAJES_POR_CAMPO;

export function validateUsuarioForm(data: UsuarioFormData): Record<string, string> {
  return validate(data, usuarioFormRules);
}

/** Lleva el foco al primer campo con error para no obligar a buscarlo a mano. */
export function focusFirstError(errors: Record<string, string>): void {
  const firstField = Object.keys(errors)[0];
  if (!firstField) return;
  requestAnimationFrame(() =>
    document.querySelector<HTMLElement>(`[data-field="${firstField}"]`)?.focus(),
  );
}

/**
 * Cableado del `<Form>` de Inertia: los campos son no controlados y el componente
 * lee sus valores del DOM, así que aquí solo queda la validación previa al envío.
 */
export function useUsuarioForm() {
  const formRef = useRef<UsuarioFormRef>(null);
  // El RUT arranca inválido (aún vacío) y el teléfono válido, porque es opcional.
  const validezRef = useRef<Record<CampoAutovalidado, boolean>>({ rut: false, telefono: true });
  const setCampoValido = useCallback((campo: CampoAutovalidado, valido: boolean) => {
    validezRef.current[campo] = valido;
  }, []);
  const setRutValido = useCallback(
    (valido: boolean) => setCampoValido('rut', valido),
    [setCampoValido],
  );
  const setTelefonoValido = useCallback(
    (valido: boolean) => setCampoValido('telefono', valido),
    [setCampoValido],
  );

  /** Se ejecuta en `onBefore`: devolver `false` cancela la petición y deja los errores en pantalla. */
  const validateBeforeSubmit = (): boolean => {
    const form = formRef.current;
    if (!form) return true;

    const errors = validateUsuarioForm(form.getData());

    // Las reglas mandan: solo se añade el aviso propio del campo si no falló ya antes.
    for (const [campo, mensaje] of Object.entries(MENSAJES_POR_CAMPO) as [
      CampoAutovalidado,
      string,
    ][]) {
      if (!errors[campo] && !validezRef.current[campo]) errors[campo] = mensaje;
    }

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

  return { formRef, validateBeforeSubmit, clearFieldError, setRutValido, setTelefonoValido };
}
