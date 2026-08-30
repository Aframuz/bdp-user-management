import { beforeEach, describe, expect, it, vi } from 'vitest';

const fire = vi.hoisted(() => vi.fn());

vi.mock('sweetalert2', () => ({ default: { fire } }));

async function loadDesktopNotice() {
    const { showDesktopNotice } = await import('@Utils/desktopNotice');

    return showDesktopNotice;
}

describe('desktop notice', () => {
    beforeEach(() => {
        vi.resetModules();
        fire.mockReset();
        window.sessionStorage.clear();
    });

    it('recommends desktop usage below 1024px', async () => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1023 });
        const showDesktopNotice = await loadDesktopNotice();

        showDesktopNotice();

        await vi.waitFor(() => expect(fire).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
            icon: 'info',
            title: 'Mejor experiencia en escritorio',
            confirmButtonText: 'Entendido',
        })));
    });

    it('does not show the notice at 1024px or wider', async () => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
        const showDesktopNotice = await loadDesktopNotice();

        showDesktopNotice();

        expect(fire).not.toHaveBeenCalled();
    });

    it('shows the notice only once per browser tab', async () => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 480 });
        let showDesktopNotice = await loadDesktopNotice();

        showDesktopNotice();
        await vi.waitFor(() => expect(fire).toHaveBeenCalledOnce());

        vi.resetModules();
        showDesktopNotice = await loadDesktopNotice();
        showDesktopNotice();

        expect(fire).toHaveBeenCalledOnce();
    });
});
