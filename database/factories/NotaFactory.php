<?php

namespace Database\Factories;

use App\Models\Nota;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotaFactory extends Factory
{
    protected $model = Nota::class;

    public function definition(): array
    {
        return [
            'usuario_id' => Usuario::factory(),
            'texto' => fake()->sentence(12),
        ];
    }
}
