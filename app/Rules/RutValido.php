<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Espejo del hook `use-rut` que valida el RUT en el formulario (ver RutField.tsx):
 * mismo módulo 11 y mismo mínimo de siete dígitos de cuerpo, para que el navegador
 * y el servidor acepten y rechacen exactamente lo mismo.
 */
class RutValido implements ValidationRule
{
    private const MENSAJE = 'El RUT/RUN ingresado no es válido.';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->esValido((string) $value)) {
            $fail(self::MENSAJE);
        }
    }

    private function esValido(string $rut): bool
    {
        $limpio = mb_strtolower(str_replace(['.', '-', ',', ' '], '', $rut));
        $cuerpo = substr($limpio, 0, -1);
        $dv = substr($limpio, -1);

        if (strlen($cuerpo) <= 6 || ! ctype_digit($cuerpo)) {
            return false;
        }

        $suma = 0;
        $multiplo = 2;

        for ($i = strlen($cuerpo) - 1; $i >= 0; $i--) {
            $suma += $multiplo * (int) $cuerpo[$i];
            $multiplo = $multiplo < 7 ? $multiplo + 1 : 2;
        }

        // La 'k' vale 10 y el 0 vale 11: así lo resuelve también el hook del formulario.
        $esperado = 11 - ($suma % 11);
        $ingresado = match (true) {
            $dv === 'k' => 10,
            $dv === '0' => 11,
            ctype_digit($dv) => (int) $dv,
            default => -1,
        };

        return $esperado === $ingresado;
    }
}
