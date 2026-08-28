import type { UserTab } from '../Types/usuario';

/** Única fuente de verdad de las URLs del mantenedor (espejo de routes/web.php). */
export const usuarios = {
    index: () => '/usuarios',
    create: () => '/usuarios/create',
    show: (id: number) => `/usuarios/${id}`,
    destroy: (id: number) => `/usuarios/${id}`,
    data: () => '/usuarios/data',
    exportCsv: (filters?: Partial<Record<'search' | 'rol' | 'estado', string>>) => {
        const query = new URLSearchParams();

        Object.entries(filters ?? {}).forEach(([key, value]) => {
            if (value) query.set(key, value);
        });

        const queryString = query.toString();
        return `/usuarios/export${queryString ? `?${queryString}` : ''}`;
    },
    tab: (id: number, tab: UserTab) => `/usuarios/${id}/tabs/${tab}`,
} as const;
