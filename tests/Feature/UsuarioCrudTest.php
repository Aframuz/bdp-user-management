<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
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
            'apellido' => '',
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

    /**
     * Los mismos criterios que aplica el formulario (use-rut y react-phone-number-input)
     * tienen que valer en el servidor: dígito verificador y numeración real del país.
     *
     * @return array<string, array{string, string, string}>
     */
    public static function valoresQueSoloRechazanLasReglasPropias(): array
    {
        return [
            'dígito verificador que no cuadra' => ['rut', '11.111.111-2', 'El RUT/RUN ingresado no es válido.'],
            'RUT demasiado corto' => ['rut', '1-9', 'El RUT/RUN ingresado no es válido.'],
            'teléfono inexistente para el país' => ['telefono', '56912345678', 'Ingresa un teléfono válido para el país seleccionado.'],
            'teléfono sin país reconocible' => ['telefono', '987654321', 'Ingresa un teléfono válido para el país seleccionado.'],
        ];
    }

    /** @return array<string, array{string, string}> */
    public static function valoresConCaracteresNoPermitidos(): array
    {
        return [
            'nombre con números' => ['nombre', 'Camila3'],
            'apellido con símbolos' => ['apellido', 'Soto!'],
            'ciudad con símbolos' => ['ciudad', 'Santiago_1'],
            'código postal con letras' => ['codigo_postal', '7500A00'],
            'apellido que empieza por separador' => ['apellido', '-Soto'],
        ];
    }

    /** @return array<string, array{string, string}> */
    public static function nombresPropiosConSeparadores(): array
    {
        return [
            'apóstrofo' => ['apellido', "O'Higgins"],
            'apóstrofo tipográfico' => ['apellido', 'O’Higgins'],
            'guion' => ['apellido', 'García-López'],
            'punto' => ['ciudad', 'St. John'],
            'espacios y tildes' => ['nombre', 'Ana María'],
        ];
    }

    /** @return array<string, array{string, int}> */
    public static function camposConLongitudMaxima(): array
    {
        return [
            'nombre' => ['nombre', 100],
            'apellido' => ['apellido', 100],
            'nota' => ['nota', 1000],
        ];
    }

    /**
     * Un apellido real puede llevar apóstrofo, guion o punto: la regla de
     * "solo letras" no debe rechazar O'Higgins ni García-López.
     */
    #[DataProvider('nombresPropiosConSeparadores')]
    public function test_store_accepts_proper_names_with_separators(string $campo, string $valor): void
    {
        $rol = Rol::factory()->create();
        $payload = array_merge($this->validPayload($rol), [$campo => $valor]);

        $this->post(route('usuarios.store'), $payload)
            ->assertRedirect(route('usuarios.index'))
            ->assertSessionHasNoErrors();

        // `ciudad` vive en `direcciones` y el resto en `usuarios`: basta con
        // comprobar que la petición no fue rechazada y el alta se completó.
        $this->assertDatabaseCount('usuarios', 1);
    }

    #[DataProvider('valoresConCaracteresNoPermitidos')]
    public function test_store_rejects_characters_not_allowed_by_the_form(string $campo, string $valor): void
    {
        $rol = Rol::factory()->create();
        $payload = array_merge($this->validPayload($rol), [$campo => $valor]);

        $this->from(route('usuarios.create'))->post(route('usuarios.store'), $payload)
            ->assertRedirect(route('usuarios.create'))
            ->assertSessionHasErrors($campo);

        $this->assertDatabaseCount('usuarios', 0);
    }

    #[DataProvider('valoresQueSoloRechazanLasReglasPropias')]
    public function test_store_rejects_values_that_pass_the_format_rules(string $campo, string $valor, string $mensaje): void
    {
        $rol = Rol::factory()->create();
        $payload = array_merge($this->validPayload($rol), [$campo => $valor]);

        $this->from(route('usuarios.create'))->post(route('usuarios.store'), $payload)
            ->assertRedirect(route('usuarios.create'))
            ->assertSessionHasErrors([$campo => $mensaje]);

        $this->assertDatabaseCount('usuarios', 0);
    }

    #[DataProvider('camposConLongitudMaxima')]
    public function test_store_accepts_values_at_the_maximum_length(string $campo, int $maximo): void
    {
        $rol = Rol::factory()->create();
        $payload = array_merge($this->validPayload($rol), [$campo => str_repeat('a', $maximo)]);

        $this->post(route('usuarios.store'), $payload)
            ->assertRedirect(route('usuarios.index'))
            ->assertSessionDoesntHaveErrors();

        $this->assertDatabaseCount('usuarios', 1);
    }

    #[DataProvider('camposConLongitudMaxima')]
    public function test_store_rejects_values_over_the_maximum_length(string $campo, int $maximo): void
    {
        $rol = Rol::factory()->create();
        $payload = array_merge($this->validPayload($rol), [$campo => str_repeat('a', $maximo + 1)]);

        $this->from(route('usuarios.create'))->post(route('usuarios.store'), $payload)
            ->assertRedirect(route('usuarios.create'))
            ->assertSessionHasErrors($campo);

        $this->assertDatabaseCount('usuarios', 0);
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
            'telefono' => '56987654321',
            'rol_id' => $rol->id,
            'estado' => 'activo',
            'calle' => 'Calle Uno 123',
            'ciudad' => 'Santiago',
            'codigo_postal' => '7500000',
            'nota' => 'Observación inicial',
        ];
    }
}
