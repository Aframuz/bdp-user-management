<?php

namespace Database\Factories;

use App\Models\Direccion;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class DireccionFactory extends Factory
{
    protected $model = Direccion::class;

    public function definition(): array
    {
        return [
            'usuario_id' => Usuario::factory(),
            'calle' => fake()->streetAddress(),
            'ciudad' => fake()->city(),
            'codigo_postal' => fake()->optional()->postcode(),
        ];
    }
}
