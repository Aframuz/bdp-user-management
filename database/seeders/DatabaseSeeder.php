<?php

namespace Database\Seeders;

use App\Models\Direccion;
use App\Models\Nota;
use App\Models\Rol;
use App\Models\Usuario;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    private const DEMO_EMAILS = [
        'ana.demo@example.test',
        'bruno.vacio@example.test',
    ];

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = collect(['Admin', 'Editor', 'Visualizador'])
            ->mapWithKeys(fn (string $nombre) => [$nombre => Rol::query()->firstOrCreate(['nombre' => $nombre])]);

        $demo = Usuario::query()->updateOrCreate(['email' => self::DEMO_EMAILS[0]], [
            'rol_id' => $roles['Admin']->id,
            'nombre' => 'Ana',
            'apellido' => 'Demo',
            'rut' => '12.345.678-9',
            'estado' => 'activo',
        ]);
        $demo->direccion()->updateOrCreate([], [
            'calle' => 'Avenida Providencia 123',
            'ciudad' => 'Santiago',
        ]);
        $demo->notas()->firstOrCreate(['texto' => 'Usuario de demostración con información completa.']);

        Usuario::query()->updateOrCreate(['email' => self::DEMO_EMAILS[1]], [
            'rol_id' => $roles['Visualizador']->id,
            'nombre' => 'Bruno',
            'apellido' => 'Sin Datos',
            'rut' => '9.876.543-2',
            'estado' => 'inactivo',
        ]);

        $missingUsers = max(
            0,
            34 - Usuario::query()->whereNotIn('email', self::DEMO_EMAILS)->count(),
        );

        Usuario::factory($missingUsers)->make(['rol_id' => $roles['Admin']->id])->each(function (Usuario $usuario, int $index) use ($roles) {
            $usuario->rol_id = $roles->values()[$index % $roles->count()]->id;
            $usuario->estado = $index % 3 === 0 ? 'inactivo' : 'activo';
            $usuario->save();

            if ($index % 7 !== 0) {
                Direccion::factory()->for($usuario)->create();
            }

            if ($index % 5 !== 0) {
                Nota::factory(($index % 3) + 1)->for($usuario)->create();
            }
        });
    }
}
