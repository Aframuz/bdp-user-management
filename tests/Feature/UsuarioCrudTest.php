<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UsuarioCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_and_create_pages_receive_backend_options(): void
    {
        Rol::query()->create(['nombre' => 'Admin']);

        $this->get(route('usuarios.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Usuarios/Index')
                ->has('roles', 1)
                ->has('estados', 2));

        $this->get(route('usuarios.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Usuarios/Create')->has('roles', 1));
    }

    public function test_store_creates_user_address_and_required_note_atomically(): void
    {
        $rol = Rol::factory()->create(['nombre' => 'Editor']);

        $response = $this->post(route('usuarios.store'), $this->validPayload($rol));

        $usuario = Usuario::query()->where('email', 'persona@example.test')->firstOrFail();
        $response->assertRedirect(route('usuarios.index'))->assertSessionHas('success');
        $this->assertDatabaseHas('direcciones', ['usuario_id' => $usuario->id, 'ciudad' => 'Santiago']);
        $this->assertDatabaseHas('notas', ['usuario_id' => $usuario->id, 'texto' => 'Observación inicial']);
    }

    public function test_store_normalizes_email_and_optional_values(): void
    {
        $rol = Rol::factory()->create();
        $payload = $this->validPayload($rol);
        $payload['email'] = '  PERSONA@EXAMPLE.TEST ';
        $payload['telefono'] = '';
        $payload['codigo_postal'] = '';

        $this->post(route('usuarios.store'), $payload)->assertRedirect();

        $this->assertDatabaseHas('usuarios', ['email' => 'persona@example.test', 'telefono' => null]);
        $this->assertDatabaseHas('direcciones', ['codigo_postal' => null]);
    }

    public function test_store_rejects_every_required_field_and_invalid_values(): void
    {
        $existingRole = Rol::factory()->create();
        Usuario::factory()->for($existingRole, 'rol')->create(['email' => 'persona@example.test']);

        $response = $this->from(route('usuarios.create'))->post(route('usuarios.store'), [
            'nombre' => '',
            'apellido' => str_repeat('a', 101),
            'email' => 'persona@example.test',
            'rut' => '',
            'telefono' => 'no-numérico',
            'rol_id' => 99999,
            'estado' => 'pendiente',
            'calle' => '',
            'ciudad' => '',
            'nota' => '',
        ]);

        $response->assertRedirect(route('usuarios.create'))
            ->assertSessionHasErrors(['nombre', 'apellido', 'email', 'rut', 'telefono', 'rol_id', 'estado', 'calle', 'ciudad', 'nota']);
        $this->assertDatabaseCount('usuarios', 1);
    }

    public function test_destroy_removes_user_and_related_records(): void
    {
        $usuario = Usuario::factory()->create();
        $usuario->direccion()->create(['calle' => 'Uno', 'ciudad' => 'Santiago']);
        $usuario->notas()->create(['texto' => 'Nota']);

        $this->delete(route('usuarios.destroy', $usuario))
            ->assertRedirect(route('usuarios.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('usuarios', ['id' => $usuario->id]);
        $this->assertDatabaseMissing('direcciones', ['usuario_id' => $usuario->id]);
        $this->assertDatabaseMissing('notas', ['usuario_id' => $usuario->id]);
    }

    private function validPayload(Rol $rol): array
    {
        return [
            'nombre' => 'Camila',
            'apellido' => 'Soto',
            'email' => 'persona@example.test',
            'rut' => '11.111.111-1',
            'telefono' => '987654321',
            'rol_id' => $rol->id,
            'estado' => 'activo',
            'calle' => 'Calle Uno 123',
            'ciudad' => 'Santiago',
            'codigo_postal' => '7500000',
            'nota' => 'Observación inicial',
        ];
    }
}
