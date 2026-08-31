import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, getInitialTheme, revealThemeChange } from '@Utils/theme';

type ViewTransitionStub = {
    start: ReturnType<typeof vi.fn>;
    finish: () => void;
    abort: () => void;
};

const root = document.documentElement;

/** Sustituye a View Transitions: deja la transición abierta hasta que el test la cierra. */
function stubViewTransitions(): ViewTransitionStub {
    let settle: () => void = () => undefined;
    let fail: () => void = () => undefined;

    const finished = new Promise<void>((resolve, reject) => {
        settle = resolve;
        fail = () => reject(new Error('transición descartada'));
    });

    const start = vi.fn((update: () => void) => {
        update();

        return { finished } as unknown as ViewTransition;
    });

    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start, writable: true });

    return { start, finish: settle, abort: fail };
}

/** jsdom no trae `matchMedia`, así que las preferencias del sistema se declaran aquí. */
function stubMatchMedia({ reducedMotion = false, darkScheme = false } = {}) {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
        matches: query.includes('prefers-reduced-motion') ? reducedMotion : darkScheme,
        media: query,
    } as MediaQueryList)));
}

describe('getInitialTheme', () => {
    afterEach(() => {
        window.localStorage.clear();
        vi.unstubAllGlobals();
    });

    it('prefers what the user chose before', () => {
        window.localStorage.setItem('bolsa-productos-theme', 'dark');

        expect(getInitialTheme()).toBe('dark');
    });

    it('falls back to the system preference when nothing was chosen', () => {
        stubMatchMedia({ darkScheme: true });

        expect(getInitialTheme()).toBe('dark');
    });

    it('ignores a stored value that is not a theme', () => {
        window.localStorage.setItem('bolsa-productos-theme', 'sepia');
        stubMatchMedia();

        expect(getInitialTheme()).toBe('light');
    });
});

describe('applyTheme', () => {
    afterEach(() => window.localStorage.clear());

    it('paints the theme on the document and remembers it', () => {
        applyTheme('dark');

        expect(root.dataset.bsTheme).toBe('dark');
        expect(window.localStorage.getItem('bolsa-productos-theme')).toBe('dark');
    });
});

describe('revealThemeChange', () => {
    beforeEach(() => {
        root.className = '';
        root.removeAttribute('style');
    });

    afterEach(() => {
        Reflect.deleteProperty(document, 'startViewTransition');
        vi.unstubAllGlobals();
    });

    it('changes the theme straight away when the browser cannot animate it', () => {
        stubMatchMedia();
        const change = vi.fn();

        revealThemeChange(null, change);

        expect(change).toHaveBeenCalledOnce();
        expect(root.classList.contains('theme-switch')).toBe(false);
    });

    it('skips the animation when the user asked for less motion', () => {
        stubMatchMedia({ reducedMotion: true });
        const transition = stubViewTransitions();
        const change = vi.fn();

        revealThemeChange(null, change);

        expect(change).toHaveBeenCalledOnce();
        expect(transition.start).not.toHaveBeenCalled();
    });

    it('grows the circle from the button and covers the furthest corner', async () => {
        stubMatchMedia();
        const transition = stubViewTransitions();
        const trigger = document.createElement('button');
        trigger.getBoundingClientRect = () => ({ left: 100, top: 20, width: 40, height: 40 }) as DOMRect;

        revealThemeChange(trigger, vi.fn());

        expect(root.classList.contains('theme-switch')).toBe(true);
        expect(root.style.getPropertyValue('--theme-switch-x')).toBe('120px');
        expect(root.style.getPropertyValue('--theme-switch-y')).toBe('40px');
        // Esquina inferior derecha del viewport de jsdom: hypot(1024 - 120, 768 - 40).
        expect(root.style.getPropertyValue('--theme-switch-radius')).toBe('1161px');

        transition.finish();
        await vi.waitFor(() => expect(root.classList.contains('theme-switch')).toBe(false));
    });

    it('cleans up even when the browser discards the transition', async () => {
        stubMatchMedia();
        const transition = stubViewTransitions();

        revealThemeChange(null, vi.fn());
        transition.abort();

        await vi.waitFor(() => expect(root.classList.contains('theme-switch')).toBe(false));
    });
});
