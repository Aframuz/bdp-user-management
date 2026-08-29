<?php

namespace App\Http\Controllers;

use App\Http\Resources\UsuarioRowResource;
use App\Models\Usuario;
use App\Support\DataTableQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsuarioDataTableController extends Controller
{
    /** Columnas por las que se acepta ordenar, por nombre lógico enviado por DataTables. */
    private const SORTABLE = ['nombre', 'email', 'rut', 'estado', 'created_at'];

    public function __invoke(Request $request): JsonResponse
    {
        $table = DataTableQuery::fromRequest($request);
        $rol = $request->string('rol')->toString();
        $estado = $request->string('estado')->toString();

        $query = Usuario::query()
            ->select(['id', 'rol_id', 'nombre', 'apellido', 'email', 'rut', 'estado', 'created_at'])
            ->with('rol:id,nombre')
            ->buscar($table->search)
            ->filtrar($rol, $estado);

        $recordsFiltered = (clone $query)->count();
        $isUnfiltered = $table->search === '' && $rol === '' && $estado === '';
        $recordsTotal = $isUnfiltered ? $recordsFiltered : Usuario::query()->count();

        $usuarios = $query
            ->orderBy($table->orderColumnIn(self::SORTABLE, 'created_at'), $table->orderDirection)
            ->orderBy('id')
            ->skip($table->start)
            ->take($table->length)
            ->get();

        return response()->json([
            'draw' => $table->draw,
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data' => UsuarioRowResource::collection($usuarios),
        ]);
    }
}
