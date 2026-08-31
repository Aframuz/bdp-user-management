/**
 * Tema claro/oscuro: dónde se recuerda la preferencia, cómo se aplica al
 * documento y cómo se anima el relevo de un tema al otro.
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'bolsa-productos-theme';

/** Mientras está puesta, app.css cambia la animación de la raíz por el círculo. */
const REVEAL_CLASS = 'theme-switch';

/** Transiciones en vuelo: con dos clicks seguidos, la clase la retira la última. */
let revealsInFlight = 0;

/** Manda lo que el usuario eligió; si nunca eligió, la preferencia del sistema. */
export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  } catch {
    // El almacenamiento puede estar deshabilitado; la preferencia del sistema sigue disponible.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Pinta el tema en el documento y lo deja recordado para la próxima visita. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.bsTheme = theme;
  document.documentElement.style.colorScheme = theme;

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // El tema sigue funcionando durante la sesión aunque no pueda persistirse.
  }
}

function canReveal(): boolean {
  return (
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/** Centro del botón que dispara el cambio; sin él, el borde superior de la ventana. */
function originOf(trigger: Element | null): { x: number; y: number } {
  if (!trigger) {
    return { x: window.innerWidth / 2, y: 0 };
  }

  const rect = trigger.getBoundingClientRect();

  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Radio hasta la esquina más lejana: con menos, el círculo dejaría un pico sin cubrir. */
function radiusFrom({ x, y }: { x: number; y: number }): number {
  return Math.ceil(
    Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)),
  );
}

/**
 * Ejecuta el cambio de tema descubriéndolo en un círculo que crece desde el
 * botón hasta cubrir la ventana.
 *
 * Se apoya en View Transitions: el navegador fotografía la página con el tema
 * anterior y la sostiene quieta debajo mientras la versión nueva se descubre
 * encima. Hacerlo con una capa de color propia, como en el patrón clásico de
 * dos círculos, solo teñiría el fondo: aquí hay cabecera, tarjetas, tabla y
 * badges que también cambian, y la instantánea los trae todos gratis.
 *
 * Sin soporte —o con «reducir movimiento» activo— el cambio se aplica al
 * instante, que es exactamente lo que hacía antes.
 */
export function revealThemeChange(trigger: Element | null, change: () => void): void {
  if (!canReveal()) {
    change();

    return;
  }

  const root = document.documentElement;
  const origin = originOf(trigger);

  root.style.setProperty('--theme-switch-x', `${origin.x}px`);
  root.style.setProperty('--theme-switch-y', `${origin.y}px`);
  root.style.setProperty('--theme-switch-radius', `${radiusFrom(origin)}px`);
  // La clase entra antes de arrancar la transición porque la foto del estado
  // anterior se toma después: para entonces la cabecera ya ha renunciado a su
  // `view-transition-name` y viaja dentro de la instantánea de la raíz.
  root.classList.add(REVEAL_CLASS);
  revealsInFlight += 1;

  const settle = () => {
    revealsInFlight -= 1;

    if (revealsInFlight === 0) {
      root.classList.remove(REVEAL_CLASS);
    }
  };

  // `finished` se rechaza si el navegador descarta la transición (por ejemplo,
  // al pulsar de nuevo antes de que termine): también ahí hay que limpiar.
  document.startViewTransition(change).finished.then(settle, settle);
}
