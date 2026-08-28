<?php

namespace App\Http\Resources;

use App\Models\Nota;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Nota */
class NotaResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'texto' => $this->texto,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
