<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class UsuarioCsvExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_exports_all_users_as_a_utf8_csv_download(): void
    {
        $rol = Rol::factory()->create(['nombre' => 'Administración']);
        Usuario::factory()->for($rol, 'rol')->create([
            'nombre' => 'María, José',
            'apellido' => 'Muñoz',
            'email' => 'maria@example.test',
            'rut' => '12.345.678-5',
            'estado' => 'activo',
        ]);
        Usuario::factory()->create(['email' => 'otro@example.test']);

        $response = $this->get(route('usuarios.export'));

        $response->assertOk()
            ->assertDownload('usuarios-'.now()->format('Y-m-d').'.csv')
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $this->assertStringStartsWith("\xEF\xBB\xBF", $response->streamedContent());

        $rows = $this->csvRows($response);
        $this->assertSame(
            ['Nombre completo', 'Email', 'RUT/RUN', 'Rol', 'Estado', 'Fecha de creación'],
            $rows[0],
        );
        $this->assertCount(3, $rows);
        $this->assertContains(
            ['María, José Muñoz', 'maria@example.test', '12.345.678-5', 'Administración', 'Activo'],
            array_map(fn (array $row) => array_slice($row, 0, 5), array_slice($rows, 1)),
        );
    }

    public function test_export_combines_search_role_and_status_filters(): void
    {
        $admin = Rol::factory()->create(['nombre' => 'Admin']);
        $viewer = Rol::factory()->create(['nombre' => 'Visualizador']);

        Usuario::factory()->for($admin, 'rol')->create([
            'nombre' => 'María',
            'apellido' => 'Objetivo',
            'email' => 'objetivo@example.test',
            'estado' => 'activo',
        ]);
        Usuario::factory()->for($viewer, 'rol')->create(['nombre' => 'María', 'estado' => 'activo']);
        Usuario::factory()->for($admin, 'rol')->create(['nombre' => 'María', 'estado' => 'inactivo']);
        Usuario::factory()->for($admin, 'rol')->create(['nombre' => 'Persona', 'estado' => 'activo']);

        $response = $this->get(route('usuarios.export', [
            'search' => 'María',
            'rol' => $admin->id,
            'estado' => 'activo',
        ]));

        $response->assertOk();

        $rows = $this->csvRows($response);
        $this->assertCount(2, $rows);
        $this->assertSame('objetivo@example.test', $rows[1][1]);
    }

    public function test_escapes_cells_that_spreadsheets_could_execute_as_formulas(): void
    {
        Usuario::factory()->create(['nombre' => '=DANGEROUS', 'apellido' => 'Formula']);

        $rows = $this->csvRows($this->get(route('usuarios.export')));

        $this->assertSame("'=DANGEROUS Formula", $rows[1][0]);
    }

    /** @return array<int, array<int, string|null>> */
    private function csvRows(TestResponse $response): array
    {
        $csv = preg_replace('/^\xEF\xBB\xBF/', '', $response->streamedContent()) ?? '';
        $stream = fopen('php://temp', 'r+');
        $this->assertNotFalse($stream);
        fwrite($stream, $csv);
        rewind($stream);

        $rows = [];
        while (($row = fgetcsv($stream, null, ',', '"', '')) !== false) {
            $rows[] = $row;
        }

        fclose($stream);

        return $rows;
    }
}
