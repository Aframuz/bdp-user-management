<?php

namespace Tests\Feature;

use App\Models\Direccion;
use App\Models\Nota;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_can_run_more_than_once(): void
    {
        $this->seed();

        $countsAfterFirstRun = $this->recordCounts();

        $this->seed();

        $this->assertSame($countsAfterFirstRun, $this->recordCounts());
        $this->assertDatabaseCount('roles', 3);
        $this->assertDatabaseCount('usuarios', 36);
        $this->assertDatabaseHas('roles', ['nombre' => 'Admin']);
        $this->assertDatabaseHas('usuarios', ['email' => 'ana.demo@example.test']);
        $this->assertDatabaseHas('usuarios', ['email' => 'bruno.vacio@example.test']);
    }

    /**
     * @return array{roles: int, usuarios: int, direcciones: int, notas: int}
     */
    private function recordCounts(): array
    {
        return [
            'roles' => Rol::query()->count(),
            'usuarios' => Usuario::query()->count(),
            'direcciones' => Direccion::query()->count(),
            'notas' => Nota::query()->count(),
        ];
    }
}
