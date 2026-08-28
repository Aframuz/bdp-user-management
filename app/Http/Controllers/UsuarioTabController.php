<?php

namespace App\Http\Controllers;

use App\Http\Resources\DireccionResource;
use App\Http\Resources\NotaResource;
use App\Http\Resources\UsuarioGeneralResource;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;

class UsuarioTabController extends Controller
{
    /**
     * Sirve el contenido de un tab de la ficha. La ruta ya restringe `$tab`
     * a los valores válidos (ver routes/web.php).
     */
    public function __invoke(Usuario $usuario, string $tab): JsonResponse
    {
        $data = match ($tab) {
            'general' => new UsuarioGeneralResource($usuario->load('rol:id,nombre')),
            'direcciones' => DireccionResource::collection(
                $usuario->direccion()->get(['id', 'usuario_id', 'calle', 'ciudad', 'codigo_postal'])
            ),
            'notas' => NotaResource::collection(
                $usuario->notas()->latest()->get(['id', 'usuario_id', 'texto', 'created_at'])
            ),
            default => abort(404),
        };

        return response()->json(['data' => $data]);
    }
}
