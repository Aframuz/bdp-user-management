<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Volumen de datos de demostración, pensado para producción.
 *
 * A diferencia de DatabaseSeeder no usa factories ni `fakerphp/faker`, que es
 * dependencia de desarrollo y no viaja en la imagen `--no-dev`. Genera los
 * datos de forma determinista a partir de listas fijas, así que puede correr
 * en el servidor.
 *
 * La cantidad se controla con SEED_USUARIOS (por defecto 200):
 *
 *   docker compose -f compose.prod.yaml run --rm -T -e SEED_USUARIOS=500 app \
 *     php artisan db:seed --class="Database\Seeders\DemoUsuariosSeeder" --force
 *
 * Es incremental: completa hasta llegar al total pedido y no duplica lo que ya
 * existe, así que repetirlo con el mismo número no hace nada.
 */
class DemoUsuariosSeeder extends Seeder
{
    private const NOMBRES = [
        'Ana', 'Benjamín', 'Camila', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Héctor',
        'Isidora', 'Joaquín', 'Karla', 'Lucas', 'Martina', 'Nicolás', 'Olivia', 'Pablo',
        'Renata', 'Sebastián', 'Trinidad', 'Vicente', 'Ximena', 'Álvaro', 'Bárbara', 'Cristóbal',
    ];

    private const APELLIDOS = [
        'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva',
        'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández',
        'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela', 'Castillo', 'Tapia',
    ];

    private const CALLES = ['Avenida Providencia', 'Calle Los Leones', 'Pasaje El Roble', 'Avenida Matta', 'Calle Bandera'];

    private const CIUDADES = ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Temuco', 'Antofagasta'];

    /** Base del cuerpo del RUT. Deja sitio de sobra sin pisar los RUT de muestra. */
    private const RUT_BASE = 15_000_000;

    public function run(): void
    {
        $total = max(0, (int) env('SEED_USUARIOS', 200));

        $roles = (new EssentialSeeder)->roles()->values();

        $existentes = Usuario::query()
            ->whereNotIn('email', EssentialSeeder::DEMO_EMAILS)
            ->count();

        $faltan = $total - $existentes;

        if ($faltan <= 0) {
            $this->command?->info("Ya hay {$existentes} usuarios de demostración; no se crea ninguno.");

            return;
        }

        $this->command?->info("Creando {$faltan} usuarios (objetivo: {$total}).");

        // Por lotes: con varios miles de filas, insertar una a una tarda
        // minutos y carga la memoria del contenedor sin necesidad.
        foreach (array_chunk(range($existentes, $total - 1), 500) as $lote) {
            $this->insertarLote($lote, $roles);
        }

        $this->command?->info('Listo: '.Usuario::query()->count().' usuarios en total.');
    }

    /**
     * @param  array<int, int>  $indices
     * @param  Collection<int, Rol>  $roles
     */
    private function insertarLote(array $indices, $roles): void
    {
        $ahora = now();
        $usuarios = [];

        foreach ($indices as $i) {
            $nombre = self::NOMBRES[$i % count(self::NOMBRES)];
            $apellido = self::APELLIDOS[intdiv($i, count(self::NOMBRES)) % count(self::APELLIDOS)];
            $cuerpo = self::RUT_BASE + $i;

            $usuarios[] = [
                'rol_id' => $roles[$i % $roles->count()]->id,
                'nombre' => $nombre,
                'apellido' => $apellido,
                // El cuerpo del RUT es único, así que el correo también lo es.
                'email' => sprintf('%s.%s.%d@example.test', $this->slug($nombre), $this->slug($apellido), $cuerpo),
                'rut' => $this->formatearRut($cuerpo),
                'telefono' => $i % 4 === 0 ? null : '9'.str_pad((string) ($i % 100000000), 8, '0', STR_PAD_LEFT),
                'estado' => $i % 3 === 0 ? 'inactivo' : 'activo',
                'created_at' => $ahora->copy()->subDays($i % 365),
                'updated_at' => $ahora,
            ];
        }

        DB::table('usuarios')->insert($usuarios);

        $ids = DB::table('usuarios')
            ->whereIn('email', array_column($usuarios, 'email'))
            ->pluck('id', 'email');

        $direcciones = [];
        $notas = [];

        foreach ($indices as $pos => $i) {
            $id = $ids[$usuarios[$pos]['email']] ?? null;

            if ($id === null) {
                continue;
            }

            // Se dejan huecos a propósito: sin dirección y sin notas son casos
            // que la vista de detalle tiene que saber mostrar vacíos.
            if ($i % 7 !== 0) {
                $direcciones[] = [
                    'usuario_id' => $id,
                    'calle' => self::CALLES[$i % count(self::CALLES)].' '.(100 + ($i % 900)),
                    'ciudad' => self::CIUDADES[$i % count(self::CIUDADES)],
                    'codigo_postal' => str_pad((string) (1000000 + $i), 7, '0', STR_PAD_LEFT),
                    'created_at' => $ahora,
                    'updated_at' => $ahora,
                ];
            }

            if ($i % 5 !== 0) {
                foreach (range(0, $i % 3) as $n) {
                    $notas[] = [
                        'usuario_id' => $id,
                        'texto' => 'Nota de seguimiento '.($n + 1).' del usuario de demostración.',
                        'created_at' => $ahora->copy()->subDays(($i + $n) % 90),
                        'updated_at' => $ahora,
                    ];
                }
            }
        }

        if ($direcciones !== []) {
            DB::table('direcciones')->insert($direcciones);
        }

        if ($notas !== []) {
            DB::table('notas')->insert($notas);
        }
    }

    /** Módulo 11, el mismo que aplica App\Rules\RutValido. */
    private function formatearRut(int $cuerpo): string
    {
        $suma = 0;
        $multiplo = 2;
        $digitos = (string) $cuerpo;

        for ($i = strlen($digitos) - 1; $i >= 0; $i--) {
            $suma += $multiplo * (int) $digitos[$i];
            $multiplo = $multiplo < 7 ? $multiplo + 1 : 2;
        }

        $esperado = 11 - ($suma % 11);
        $dv = match ($esperado) {
            11 => '0',
            10 => 'k',
            default => (string) $esperado,
        };

        return number_format($cuerpo, 0, '', '.').'-'.$dv;
    }

    private function slug(string $texto): string
    {
        return strtolower((string) preg_replace('/[^a-z]/i', '', iconv('UTF-8', 'ASCII//TRANSLIT', $texto)));
    }
}
