<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsuarioDataTableTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_datatables_server_side_contract_and_paginates(): void
    {
        $rol = Rol::factory()->create(['nombre' => 'Admin']);
        Usuario::factory(15)->for($rol, 'rol')->create();

        $response = $this->getJson(route('usuarios.data', [
            'draw' => 7,
            'start' => 10,
            'length' => 10,
            'order' => [['column' => 5, 'dir' => 'desc']],
        ]));

        $response->assertOk()
            ->assertJsonPath('draw', 7)
            ->assertJsonPath('recordsTotal', 15)
            ->assertJsonPath('recordsFiltered', 15)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure(['data' => [['id', 'nombre_completo', 'email', 'rut', 'rol', 'estado', 'created_at']]]);
    }

    public function test_general_search_covers_name_email_rut_and_role(): void
    {
        $admin = Rol::factory()->create(['nombre' => 'Admin']);
        $viewer = Rol::factory()->create(['nombre' => 'Visualizador']);
        Usuario::factory()->for($admin, 'rol')->create(['nombre' => 'María', 'apellido' => 'Paz', 'email' => 'maria@example.test', 'rut' => '1-9']);
        Usuario::factory()->for($viewer, 'rol')->create(['nombre' => 'Otro', 'apellido' => 'Usuario', 'email' => 'otro@example.test', 'rut' => '2-7']);

        foreach (['María Paz', 'maria@example', '1-9', 'Admin'] as $search) {
            $this->getJson(route('usuarios.data', ['search' => ['value' => $search], 'length' => 10]))
                ->assertOk()
                ->assertJsonPath('recordsFiltered', 1)
                ->assertJsonPath('data.0.email', 'maria@example.test');
        }
    }

    public function test_combines_role_and_status_filters(): void
    {
        $admin = Rol::factory()->create();
        Usuario::factory()->for($admin, 'rol')->create(['estado' => 'activo']);
        Usuario::factory()->for($admin, 'rol')->create(['estado' => 'inactivo']);
        Usuario::factory()->create(['estado' => 'activo']);

        $this->getJson(route('usuarios.data', ['rol' => $admin->id, 'estado' => 'activo', 'length' => 10]))
            ->assertOk()
            ->assertJsonPath('recordsTotal', 3)
            ->assertJsonPath('recordsFiltered', 1)
            ->assertJsonPath('data.0.estado', 'activo');
    }

    public function test_ignores_untrusted_order_columns_and_limits_page_size(): void
    {
        Usuario::factory(105)->create();

        $this->getJson(route('usuarios.data', [
            'length' => 1000,
            'order' => [['column' => 99, 'dir' => 'drop table']],
        ]))->assertOk()->assertJsonCount(100, 'data');
    }

    public function test_search_treats_like_wildcards_as_literal_text(): void
    {
        $rol = Rol::factory()->create(['nombre' => 'Admin']);
        Usuario::factory(4)->for($rol, 'rol')->create();
        Usuario::factory()->for($rol, 'rol')->create(['nombre' => 'Porcentaje%Raro']);

        $response = $this->getJson(route('usuarios.data', ['draw' => 1, 'search' => ['value' => '%']]));

        // Sin escapar, "%" haría de comodín y devolvería los cinco usuarios.
        $response->assertOk()
            ->assertJsonPath('recordsTotal', 5)
            ->assertJsonPath('recordsFiltered', 1)
            ->assertJsonPath('data.0.nombre_completo', fn (string $nombre) => str_contains($nombre, 'Porcentaje%Raro'));
    }

    public function test_orders_by_the_column_name_sent_by_datatables(): void
    {
        $rol = Rol::factory()->create(['nombre' => 'Admin']);
        foreach (['Carla', 'Ana', 'Bruno'] as $nombre) {
            Usuario::factory()->for($rol, 'rol')->create(['nombre' => $nombre]);
        }

        $response = $this->getJson(route('usuarios.data', [
            'draw' => 1,
            'columns' => [['name' => 'nombre'], ['name' => 'email']],
            'order' => [['column' => 0, 'dir' => 'asc']],
        ]));

        $nombres = array_column($response->json('data'), 'nombre_completo');

        $this->assertSame(['Ana', 'Bruno', 'Carla'], array_map(
            fn (string $nombreCompleto) => explode(' ', $nombreCompleto)[0],
            $nombres,
        ));
    }
}
