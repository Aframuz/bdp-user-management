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
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = collect(['Admin', 'Editor', 'Visualizador'])
            ->mapWithKeys(fn (string $nombre) => [$nombre => Rol::query()->create(['nombre' => $nombre])]);

        $demo = Usuario::factory()->create([
            'rol_id' => $roles['Admin']->id,
            'nombre' => 'Ana',
            'apellido' => 'Demo',
            'email' => 'ana.demo@example.test',
            'rut' => '12.345.678-9',
            'estado' => 'activo',
        ]);
        Direccion::factory()->for($demo)->create(['calle' => 'Avenida Providencia 123', 'ciudad' => 'Santiago']);
        Nota::factory()->for($demo)->create(['texto' => 'Usuario de demostración con información completa.']);

        Usuario::factory()->create([
            'rol_id' => $roles['Visualizador']->id,
            'nombre' => 'Bruno',
            'apellido' => 'Sin Datos',
            'email' => 'bruno.vacio@example.test',
            'rut' => '9.876.543-2',
            'estado' => 'inactivo',
        ]);

        Usuario::factory(34)->make(['rol_id' => $roles['Admin']->id])->each(function (Usuario $usuario, int $index) use ($roles) {
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
