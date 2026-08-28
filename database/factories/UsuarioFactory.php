<?php

namespace Database\Factories;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    public function definition(): array
    {
        return [
            'rol_id' => Rol::factory(),
            'nombre' => fake()->firstName(),
            'apellido' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'rut' => fake()->unique()->numerify('##.###.###-#'),
            'telefono' => fake()->optional()->numerify('9########'),
            'estado' => fake()->randomElement(Usuario::ESTADOS),
        ];
    }
}
