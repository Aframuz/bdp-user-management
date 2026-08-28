<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UsuarioTabsTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_only_contains_summary_data(): void
    {
        $usuario = Usuario::factory()->create();
        $usuario->direccion()->create(['calle' => 'Calle Uno', 'ciudad' => 'Valparaíso']);
        $usuario->notas()->create(['texto' => 'Nota privada']);

        $this->get(route('usuarios.show', $usuario))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Usuarios/Show')
                ->has('usuario', fn (Assert $summary) => $summary
                    ->where('id', $usuario->id)
                    ->hasAll(['nombre_completo', 'email', 'rol', 'estado']))
                ->missing('direcciones')
                ->missing('notas'));
    }

    public function test_each_tab_returns_only_its_requested_data(): void
    {
        $usuario = Usuario::factory()->create(['telefono' => '912345678']);
        $usuario->direccion()->create(['calle' => 'Calle Uno', 'ciudad' => 'Valparaíso']);
        $usuario->notas()->create(['texto' => 'Primera nota']);

        $this->getJson(route('usuarios.tabs.show', [$usuario, 'general']))
            ->assertOk()->assertJsonPath('data.email', $usuario->email)->assertJsonMissing(['calle' => 'Calle Uno']);
        $this->getJson(route('usuarios.tabs.show', [$usuario, 'direcciones']))
            ->assertOk()->assertJsonPath('data.0.ciudad', 'Valparaíso')->assertJsonMissing(['texto' => 'Primera nota']);
        $this->getJson(route('usuarios.tabs.show', [$usuario, 'notas']))
            ->assertOk()->assertJsonPath('data.0.texto', 'Primera nota')->assertJsonMissing(['ciudad' => 'Valparaíso']);
    }

    public function test_empty_relations_are_explicit_empty_arrays(): void
    {
        $usuario = Usuario::factory()->create();

        $this->getJson(route('usuarios.tabs.show', [$usuario, 'direcciones']))->assertExactJson(['data' => []]);
        $this->getJson(route('usuarios.tabs.show', [$usuario, 'notas']))->assertExactJson(['data' => []]);
    }

    public function test_invalid_tab_or_user_returns_not_found(): void
    {
        $usuario = Usuario::factory()->create();

        $this->getJson("/usuarios/{$usuario->id}/tabs/desconocido")->assertNotFound();
        $this->getJson('/usuarios/99999/tabs/general')->assertNotFound();
    }
}
