<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Usuario;
use App\Rules\RutValido;
use App\Rules\TelefonoValido;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nombre' => trim((string) $this->input('nombre')),
            'apellido' => trim((string) $this->input('apellido')),
            'email' => mb_strtolower(trim((string) $this->input('email'))),
            'rut' => trim((string) $this->input('rut')),
            'telefono' => $this->filled('telefono') ? trim((string) $this->input('telefono')) : null,
            'calle' => trim((string) $this->input('calle')),
            'ciudad' => trim((string) $this->input('ciudad')),
            'codigo_postal' => $this->filled('codigo_postal') ? trim((string) $this->input('codigo_postal')) : null,
            'nota' => trim((string) $this->input('nota')),
        ]);
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100', 'regex:/^[\p{L}\p{M} ]+$/u'],
            'apellido' => ['required', 'string', 'max:100', 'regex:/^[\p{L}\p{M} ]+$/u'],
            'email' => ['required', 'email', 'max:255', 'unique:usuarios,email'],
            'rut' => ['required', 'string', 'max:30', new RutValido],
            'telefono' => ['nullable', 'string', 'regex:/^\\d{6,15}$/', new TelefonoValido],
            'rol_id' => ['required', 'integer', 'exists:roles,id'],
            'estado' => ['required', Rule::in(Usuario::ESTADOS)],
            'calle' => ['required', 'string', 'max:255'],
            'ciudad' => ['required', 'string', 'max:100', 'regex:/^[\p{L}\p{M} ]+$/u'],
            'codigo_postal' => ['nullable', 'string', 'max:20', 'regex:/^\d+$/'],
            'nota' => ['required', 'string', 'max:1000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'rol_id' => 'rol',
            'codigo_postal' => 'código postal',
            'nota' => 'nota u observación',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'email' => 'Ingresa un correo electrónico válido.',
            'unique' => 'Este :attribute ya está registrado.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'nombre.regex' => 'El campo nombre solo puede contener letras y espacios.',
            'apellido.regex' => 'El campo apellido solo puede contener letras y espacios.',
            'telefono.regex' => 'El campo teléfono solo puede contener números (entre 6 y 15 dígitos).',
            'ciudad.regex' => 'El campo ciudad solo puede contener letras y espacios.',
            'codigo_postal.regex' => 'El código postal solo puede contener números.',
            'exists' => 'La opción seleccionada para :attribute no es válida.',
            'in' => 'La opción seleccionada para :attribute no es válida.',
        ];
    }
}
