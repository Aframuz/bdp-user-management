import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlashMessages } from '@Types/inertia';

const flash = vi.hoisted(() => ({ current: {} as FlashMessages }));
const showDesktopNotice = vi.hoisted(() => vi.fn());
const showToast = vi.hoisted(() => vi.fn());

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
    usePage: () => ({ props: { flash: flash.current } }),
}));

vi.mock('@Utils/toast', () => ({ showToast }));
vi.mock('@Utils/desktopNotice', () => ({ showDesktopNotice }));

const { AdminLayout } = await import('@Layouts/AdminLayout');

const renderLayout = (messages: FlashMessages) => {
    flash.current = messages;

    return render(<AdminLayout>Contenido</AdminLayout>);
};

describe('AdminLayout', () => {
    beforeEach(() => {
        showDesktopNotice.mockClear();
        showToast.mockClear();
    });

    it('checks whether the desktop recommendation is needed on mount', () => {
        const { rerender } = renderLayout({});

        expect(showDesktopNotice).toHaveBeenCalledOnce();

        rerender(<AdminLayout>Contenido actualizado</AdminLayout>);
        expect(showDesktopNotice).toHaveBeenCalledOnce();
    });

    it('announces a successful flash once per message', () => {
        const { rerender } = renderLayout({ success: 'Usuario creado correctamente.', id: 'flash-1' });

        expect(showToast).toHaveBeenCalledExactlyOnceWith('success', 'Usuario creado correctamente.');

        // Un re-render de la misma página no debe volver a anunciarlo.
        rerender(<AdminLayout>Contenido</AdminLayout>);
        expect(showToast).toHaveBeenCalledOnce();
    });

    it('repeats an identical message when it comes from a new flash', () => {
        const { rerender } = renderLayout({ success: 'Usuario eliminado correctamente.', id: 'flash-1' });

        flash.current = { success: 'Usuario eliminado correctamente.', id: 'flash-2' };
        rerender(<AdminLayout>Contenido</AdminLayout>);

        expect(showToast).toHaveBeenCalledTimes(2);
    });

    it('announces errors as the error variant', () => {
        renderLayout({ error: 'No pudimos eliminar el usuario.', id: 'flash-3' });

        expect(showToast).toHaveBeenCalledExactlyOnceWith('error', 'No pudimos eliminar el usuario.');
    });

    it('stays quiet when there is no flash', () => {
        renderLayout({});

        expect(showToast).not.toHaveBeenCalled();
    });
});
