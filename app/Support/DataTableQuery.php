<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Traduce los parámetros del protocolo server-side de DataTables a un objeto
 * con valores ya saneados, para que los controladores no lidien con el formato.
 */
final class DataTableQuery
{
    private const MIN_LENGTH = 10;

    private const MAX_LENGTH = 100;

    public function __construct(
        public readonly int $draw,
        public readonly int $start,
        public readonly int $length,
        public readonly string $search,
        public readonly ?string $orderColumn,
        public readonly string $orderDirection,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $orderIndex = $request->input('order.0.column');
        $orderColumn = is_numeric($orderIndex)
            ? $request->input("columns.{$orderIndex}.name")
            : null;

        return new self(
            draw: max(0, $request->integer('draw')),
            start: max(0, $request->integer('start')),
            length: min(self::MAX_LENGTH, max(self::MIN_LENGTH, $request->integer('length', self::MIN_LENGTH))),
            search: self::extractSearch($request),
            orderColumn: is_string($orderColumn) ? $orderColumn : null,
            orderDirection: $request->input('order.0.dir') === 'asc' ? 'asc' : 'desc',
        );
    }

    /**
     * Devuelve la columna de orden si está en la lista permitida; si no, el fallback.
     *
     * @param  array<int, string>  $allowed
     */
    public function orderColumnIn(array $allowed, string $fallback): string
    {
        return in_array($this->orderColumn, $allowed, true) ? $this->orderColumn : $fallback;
    }

    /** DataTables envía `search[value]`; aceptamos también `search` plano. */
    private static function extractSearch(Request $request): string
    {
        $search = $request->input('search.value') ?? $request->input('search');

        return is_string($search) ? $search : '';
    }
}
