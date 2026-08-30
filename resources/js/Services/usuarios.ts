import type { Direccion, Nota, UserTab, UsuarioGeneral } from '@Types/usuario';
import { usuarios } from '@Utils/routes';

/** Forma del payload de cada tab, alineada con App\Http\Resources. */
export interface UserTabPayload {
    general: UsuarioGeneral;
    direcciones: Direccion[];
    notas: Nota[];
}

export async function fetchUserTab<T extends UserTab>(
    usuarioId: number,
    tab: T,
    signal?: AbortSignal,
): Promise<UserTabPayload[T]> {
    const response = await fetch(usuarios.tab(usuarioId, tab), {
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        signal,
    });

    if (!response.ok) {
        throw new Error('No fue posible cargar esta sección.');
    }

    const payload = (await response.json()) as { data: UserTabPayload[T] };
    return payload.data;
}
