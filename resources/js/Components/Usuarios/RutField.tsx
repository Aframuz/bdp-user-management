import { useEffect, useState } from 'react';
import useRut from 'use-rut';
import { FormField } from '@Components/Common/FormField';
import { RUT_INVALIDO } from '@Hooks/useUsuarioForm';
import { USUARIO_CAMPOS } from '@Hooks/usuarioFormSecciones';
import { getInputValidationProps } from '@Hooks/usuarioFormRules';

interface RutFieldProps {
  error?: string;
  onValidChange: (valido: boolean) => void;
}

const CARACTERES_DE_FORMATO = /[.-]/g;
const RUT_PARCIAL_PERMITIDO = /^(?:\d{0,9}|\d{7,8}K)$/;

/**
 * Quita únicamente la puntuación generada por `use-rut`. El resultado debe tener
 * hasta nueve dígitos, o siete u ocho dígitos seguidos por K.
 */
function rutSinFormatoPermitido(value: string): string | null {
  const rutSinFormato = value.replace(CARACTERES_DE_FORMATO, '').toUpperCase();

  return RUT_PARCIAL_PERMITIDO.test(rutSinFormato) ? rutSinFormato : null;
}

/**
 * Campo controlado dentro del `<Form>` no controlado de Inertia: `use-rut` formatea
 * mientras se escribe y el componente lee el valor del DOM al enviar, así que basta
 * con que el control conserve su `name`.
 */
export function RutField({ error, onValidChange }: RutFieldProps) {
  const [rut, valido, setRut] = useRut();
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    onValidChange(valido);
  }, [onValidChange, valido]);

  /** Solo se avisa tras salir del campo: mientras se teclea todo RUT parcial es inválido. */
  const localError = touched && rut !== '' && !valido ? RUT_INVALIDO : undefined;

  return (
    <FormField
      {...getInputValidationProps('rut')}
      error={error ?? localError}
      hint="Ingresa solo números o K; los puntos y el guion se agregan automáticamente."
      id="rut"
      label={USUARIO_CAMPOS.rut}
      onBlur={() => setTouched(true)}
      onChange={(event) => {
        const rutPermitido = rutSinFormatoPermitido(event.target.value);
        if (rutPermitido !== null) setRut(rutPermitido);
      }}
      placeholder="12.345.678-9"
      value={rut}
    />
  );
}
