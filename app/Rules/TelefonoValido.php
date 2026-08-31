<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use libphonenumber\NumberParseException;
use libphonenumber\PhoneNumberUtil;

/**
 * Espejo de `isValidPhoneNumber` de react-phone-number-input (ver TelefonoField.tsx),
 * que se importa desde `/max` para compartir la metadata completa de libphonenumber
 * con esta librería. El formulario envía el número internacional en dígitos, así que
 * se le devuelve el `+` para poder interpretarlo.
 */
class TelefonoValido implements ValidationRule
{
    private const MENSAJE = 'Ingresa un teléfono válido para el país seleccionado.';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $util = PhoneNumberUtil::getInstance();

        try {
            $numero = $util->parse('+'.$value, null);
        } catch (NumberParseException) {
            $fail(self::MENSAJE);

            return;
        }

        if (! $util->isValidNumber($numero)) {
            $fail(self::MENSAJE);
        }
    }
}
