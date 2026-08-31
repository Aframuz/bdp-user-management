<?php

namespace Database\Seeders;

use App\Models\Direccion;
use App\Models\Nota;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Siembra completa para desarrollo y tests: los datos esenciales más el
     * volumen aleatorio que hace falta para ejercitar paginación y filtros.
     *
     * Usa factories, así que depende de `fakerphp/faker` y NO puede correr en
     * producción. Allí se ejecuta solo EssentialSeeder.
     */
    public function run(): void
    {
        $essential = new EssentialSeeder;
        $this->call(EssentialSeeder::class);
        $roles = $essential->roles();

        $missingUsers = max(
            0,
            34 - Usuario::query()->whereNotIn('email', EssentialSeeder::DEMO_EMAILS)->count(),
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
