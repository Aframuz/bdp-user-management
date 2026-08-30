import { useEffect, useState } from 'react';
// `/max` trae la metadata completa de libphonenumber: la de por defecto (`min`) solo
// mide longitudes y daría por bueno números que `App\Rules\TelefonoValido` rechaza.
import PhoneInput, { isValidPhoneNumber, type Value } from 'react-phone-number-input/max';
import es from 'react-phone-number-input/locale/es.json';
import 'react-phone-number-input/style.css';
import { FieldWrapper } from '@Components/Common/FieldWrapper';
import { TELEFONO_INVALIDO } from '@Hooks/useUsuarioForm';
import styles from '@Components/Common/FormControls.module.css';

/**
 * El locale traduce el selector de país como «Número de teléfono del país», que se
 * confunde con la etiqueta del campo; nombrarlo por lo que hace deja dos controles
 * distinguibles para quien navega por voz o lector de pantalla.
 */
const labels = { ...es, country: 'País del número' };

interface TelefonoFieldProps {
    /** Error del formulario (validación previa o backend); tiene prioridad sobre el aviso local. */
    error?: string;
    /** Informa al formulario si el número cuadra con el país elegido, para poder frenar el envío. */
    onValidChange: (valido: boolean) => void;
}

/**
 * Teléfono en formato internacional con Chile por defecto. El control visible es
 * controlado por `react-phone-number-input` y muestra el número formateado, así que
 * el valor que espera el backend viaja en un campo oculto: el `<Form>` de Inertia
 * arma su payload leyendo el DOM y solo mira los controles con `name`.
 */
export function TelefonoField({ error, onValidChange }: TelefonoFieldProps) {
    const [telefono, setTelefono] = useState<Value>();
    const [touched, setTouched] = useState(false);

    // El campo es opcional: vacío también es válido.
    const valido = !telefono || isValidPhoneNumber(telefono);

    useEffect(() => {
        onValidChange(valido);
    }, [onValidChange, valido]);

    /** Solo se avisa tras salir del campo: mientras se teclea todo número parcial es inválido. */
    const localError = touched && !valido ? TELEFONO_INVALIDO : undefined;

    return (
        <FieldWrapper
            error={error ?? localError}
            hint="Opcional. Se guarda en formato internacional."
            id="telefono"
            label="Teléfono"
        >
            {({ isInvalid, name, ...controlProps }) => (
                <>
                    <PhoneInput
                        {...controlProps}
                        autoComplete="tel"
                        // `Form.Group` reparte su `controlId` por contexto y esto no es un control
                        // de react-bootstrap: sin `id` explícito la etiqueta se queda sin destino.
                        id="telefono"
                        className={`${styles['phone-input']} ${isInvalid ? 'is-invalid' : ''}`}
                        countryCallingCodeEditable={false}
                        defaultCountry="CL"
                        international
                        labels={labels}
                        limitMaxLength
                        numberInputProps={{ className: styles['phone-input__number'] }}
                        onBlur={() => setTouched(true)}
                        onChange={setTelefono}
                        value={telefono}
                    />
                    {/* Solo dígitos, como espera `StoreUsuarioRequest`: el `+` del E.164 sobra. */}
                    <input name={name} type="hidden" value={telefono?.replace(/\D/g, '') ?? ''} />
                </>
            )}
        </FieldWrapper>
    );
}
