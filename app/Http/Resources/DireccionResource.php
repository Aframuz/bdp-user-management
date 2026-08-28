<?php

namespace App\Http\Resources;

use App\Models\Direccion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Direccion */
class DireccionResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'calle' => $this->calle,
            'ciudad' => $this->ciudad,
            'codigo_postal' => $this->codigo_postal,
        ];
    }
}
