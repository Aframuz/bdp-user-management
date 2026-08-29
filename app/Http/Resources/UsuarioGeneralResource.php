<?php

namespace App\Http\Resources;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Usuario */
class UsuarioGeneralResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'email' => $this->email,
            'rut' => $this->rut,
            'telefono' => $this->telefono,
            'rol' => $this->rol->nombre,
            'estado' => $this->estado,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
