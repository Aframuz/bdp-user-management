import { useEffect, useState } from 'react';
import useRut from 'use-rut';
import { FormField } from '@Components/Common/FormField';
import { RUT_INVALIDO } from '@Hooks/useUsuarioForm';
import { USUARIO_CAMPOS } from '@Hooks/usuarioFormSecciones';

interface RutFieldProps {
  error?: string;
  onValidChange: (valido: boolean) => void;
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
      error={error ?? localError}
      hint="Se formatea automáticamente al escribir."
      id="rut"
      label={USUARIO_CAMPOS.rut}
      onBlur={() => setTouched(true)}
      onChange={(event) => setRut(event.target.value)}
      placeholder="12.345.678-9"
      required
      value={rut}
    />
  );
}
