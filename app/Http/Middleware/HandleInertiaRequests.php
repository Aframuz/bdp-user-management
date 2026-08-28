<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                // Identificador único por mensaje: permite al frontend distinguir dos
                // flashes consecutivos con el mismo texto (p. ej. dos borrados seguidos).
                'id' => fn () => $request->session()->has('success') || $request->session()->has('error')
                    ? (string) Str::uuid()
                    : null,
            ],
        ];
    }
}
