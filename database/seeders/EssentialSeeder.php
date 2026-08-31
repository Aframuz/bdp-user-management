<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

/**
 * Datos mínimos para que la aplicación funcione: los roles, que el formulario
 * de alta necesita sí o sí, y dos usuarios de muestra.
 *
 * No usa factories a propósito. `fakerphp/faker` es dependencia de desarrollo
 * y la imagen de producción se construye con `composer install --no-dev`, así
 * que este seeder es el único que puede ejecutarse en el servidor. Es
 * idempotente (`firstOrCreate` / `updateOrCreate`): repetirlo no duplica nada.
 */
class EssentialSeeder extends Seeder
{
    public const DEMO_EMAILS = [
        'ana.demo@example.test',
        'bruno.vacio@example.test',
    ];

    public function run(): void
    {
        $roles = $this->roles();

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
    }

    /**
     * @return Collection<string, Rol>
     */
    public function roles(): Collection
    {
        return collect(['Admin', 'Editor', 'Visualizador'])
            ->mapWithKeys(fn (string $nombre) => [$nombre => Rol::query()->firstOrCreate(['nombre' => $nombre])]);
    }
}
