<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Usuario extends Model
{
    use HasFactory;

    public const ESTADOS = ['activo', 'inactivo'];

    protected $fillable = [
        'rol_id',
        'nombre',
        'apellido',
        'email',
        'rut',
        'telefono',
        'estado',
    ];

    protected function nombreCompleto(): Attribute
    {
        return Attribute::get(fn (): string => trim("{$this->nombre} {$this->apellido}"));
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class);
    }

    public function direccion(): HasOne
    {
        return $this->hasOne(Direccion::class);
    }

    public function notas(): HasMany
    {
        return $this->hasMany(Nota::class);
    }

    public function scopeBuscar(Builder $query, ?string $search): Builder
    {
        $search = trim((string) $search);

        if ($search === '') {
            return $query;
        }

        return $query->where(function (Builder $query) use ($search) {
            $term = '%'.self::escaparComodines($search).'%';

            $query->where('nombre', 'ilike', $term)
                ->orWhere('apellido', 'ilike', $term)
                ->orWhereRaw("concat(nombre, ' ', apellido) ilike ?", [$term])
                ->orWhere('email', 'ilike', $term)
                ->orWhere('rut', 'ilike', $term)
                ->orWhereHas('rol', fn (Builder $roleQuery) => $roleQuery->where('nombre', 'ilike', $term));
        });
    }

    /**
     * Neutraliza los comodines de LIKE para que "%" o "_" se busquen literalmente
     * en lugar de expandir la coincidencia a todo el listado.
     */
    private static function escaparComodines(string $search): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $search);
    }

    public function scopeFiltrar(Builder $query, ?string $rolId, ?string $estado): Builder
    {
        return $query
            ->when($rolId, fn (Builder $query) => $query->where('rol_id', $rolId))
            ->when(in_array($estado, self::ESTADOS, true), fn (Builder $query) => $query->where('estado', $estado));
    }
}
