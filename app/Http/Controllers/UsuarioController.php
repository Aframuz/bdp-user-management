<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Resources\UsuarioSummaryResource;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Usuarios/Index', $this->formOptions());
    }

    public function create(): Response
    {
        return Inertia::render('Usuarios/Create', $this->formOptions());
    }

    public function store(StoreUsuarioRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $usuario = Usuario::query()->create([
                'rol_id' => $data['rol_id'],
                'nombre' => $data['nombre'],
                'apellido' => $data['apellido'],
                'email' => $data['email'],
                'rut' => $data['rut'],
                'telefono' => $data['telefono'],
                'estado' => $data['estado'],
            ]);

            $usuario->direccion()->create([
                'calle' => $data['calle'],
                'ciudad' => $data['ciudad'],
                'codigo_postal' => $data['codigo_postal'],
            ]);
            $usuario->notas()->create(['texto' => $data['nota']]);
        });

        return to_route('usuarios.index')->with('success', 'Usuario registrado correctamente.');
    }

    public function show(Usuario $usuario): Response
    {
        return Inertia::render('Usuarios/Show', [
            'usuario' => new UsuarioSummaryResource($usuario->load('rol:id,nombre')),
        ]);
    }

    public function destroy(Usuario $usuario): RedirectResponse
    {
        $usuario->delete();

        return to_route('usuarios.index')->with('success', 'Usuario eliminado correctamente.');
    }

    private function formOptions(): array
    {
        return [
            'roles' => Rol::query()->orderBy('nombre')->get(['id', 'nombre']),
            'estados' => collect(Usuario::ESTADOS)->map(fn (string $estado) => [
                'value' => $estado,
                'label' => ucfirst($estado),
            ])->values(),
        ];
    }
}
