import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchUserTab } from '../Services/usuarios';
import type { Direccion, Nota, UserTab, UsuarioGeneral } from '../Types/usuario';

export interface TabState<T> {
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: string | null;
}

/** Tipo de dato que devuelve cada tab, para que los componentes no necesiten casts. */
export interface UserTabStates {
    general: TabState<UsuarioGeneral>;
    direcciones: TabState<Direccion[]>;
    notas: TabState<Nota[]>;
}

const initialTabState = <T,>(): TabState<T> => ({ status: 'idle', data: null, error: null });

export function useLazyUserTabs(usuarioId: number) {
    const [states, setStates] = useState<UserTabStates>({
        general: initialTabState<UsuarioGeneral>(),
        direcciones: initialTabState<Direccion[]>(),
        notas: initialTabState<Nota[]>(),
    });
    const statesRef = useRef(states);
    const controllersRef = useRef<Partial<Record<UserTab, AbortController>>>({});

    useEffect(() => {
        statesRef.current = states;
    }, [states]);

    useEffect(
        () => () => Object.values(controllersRef.current).forEach((controller) => controller?.abort()),
        [],
    );

    const load = useCallback(
        async (tab: UserTab, force = false) => {
            const current = statesRef.current[tab];
            if (!force && (current.status === 'loading' || current.status === 'success')) return;

            controllersRef.current[tab]?.abort();
            const controller = new AbortController();
            controllersRef.current[tab] = controller;

            setStates((previous) => ({
                ...previous,
                [tab]: { ...previous[tab], status: 'loading', error: null },
            }));

            try {
                const data = await fetchUserTab(usuarioId, tab, controller.signal);
                setStates((previous) => ({
                    ...previous,
                    [tab]: { status: 'success', data, error: null },
                }));
            } catch (error) {
                if (controller.signal.aborted) return;
                setStates((previous) => ({
                    ...previous,
                    [tab]: {
                        status: 'error',
                        data: null,
                        error: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
                    },
                }));
            }
        },
        [usuarioId],
    );

    return { states, load, retry: (tab: UserTab) => load(tab, true) };
}
