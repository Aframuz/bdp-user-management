import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLazyUserTabs } from '../../resources/js/Hooks/useLazyUserTabs';

describe('useLazyUserTabs', () => {
    afterEach(() => vi.restoreAllMocks());

    it('loads a tab once and keeps its data cached', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
            data: { nombre: 'Ana', apellido: 'Demo' },
        }), { status: 200 }));
        const { result } = renderHook(() => useLazyUserTabs(3));

        act(() => { void result.current.load('general'); });
        await waitFor(() => expect(result.current.states.general.status).toBe('success'));
        act(() => { void result.current.load('general'); });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/usuarios/3/tabs/general', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    });

    it('exposes an error and retries the request', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(new Response('', { status: 500 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }));
        const { result } = renderHook(() => useLazyUserTabs(3));

        act(() => { void result.current.load('notas'); });
        await waitFor(() => expect(result.current.states.notas.status).toBe('error'));
        act(() => { void result.current.retry('notas'); });
        await waitFor(() => expect(result.current.states.notas.status).toBe('success'));

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
