<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UsuarioCsvExportController extends Controller
{
    private const CSV_HEADERS = [
        'Nombre completo',
        'Email',
        'RUT/RUN',
        'Rol',
        'Estado',
        'Fecha de creación',
    ];

    public function __invoke(Request $request): StreamedResponse
    {
        $search = $request->string('search')->toString();
        $rol = $request->string('rol')->toString();
        $estado = $request->string('estado')->toString();
        $filename = 'usuarios-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($search, $rol, $estado): void {
            $output = fopen('php://output', 'w');

            if ($output === false) {
                return;
            }

            // El BOM permite que Excel reconozca correctamente tildes y eñes en UTF-8.
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, self::CSV_HEADERS, ',', '"', '');

            Usuario::query()
                ->select(['id', 'rol_id', 'nombre', 'apellido', 'email', 'rut', 'estado', 'created_at'])
                ->with('rol:id,nombre')
                ->buscar($search)
                ->filtrar($rol, $estado)
                ->lazyById()
                ->each(function (Usuario $usuario) use ($output): void {
                    fputcsv($output, [
                        $this->spreadsheetSafe($usuario->nombre_completo),
                        $this->spreadsheetSafe($usuario->email),
                        $this->spreadsheetSafe($usuario->rut),
                        $this->spreadsheetSafe($usuario->rol->nombre),
                        ucfirst($usuario->estado),
                        $usuario->created_at?->toIso8601String() ?? '',
                    ], ',', '"', '');
                });

            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** Evita que una celda controlada por un usuario se interprete como fórmula. */
    private function spreadsheetSafe(string $value): string
    {
        return preg_match('/^[=+\-@\t\r]/', $value) === 1 ? "'{$value}" : $value;
    }
}
