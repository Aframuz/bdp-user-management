<?php

namespace App\Http\Resources;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Usuario */
class UsuarioRowResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre_completo' => $this->nombre_completo,
            'email' => $this->email,
            'rut' => $this->rut,
            'rol' => $this->rol->nombre,
            'estado' => $this->estado,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
