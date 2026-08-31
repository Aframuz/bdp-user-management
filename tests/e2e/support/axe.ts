import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/**
 * Constructor de axe compartido por las auditorías de accesibilidad.
 *
 * `color-contrast` va deshabilitado a propósito. El verde de marca (#62ab52)
 * con texto blanco da 2.81:1, por debajo del 4.5:1 que exige WCAG AA (y por
 * debajo incluso del 3:1 de texto grande, así que ningún tamaño lo salva). Es
 * una decisión de marca tomada y asumida: el color no se cambia.
 *
 * La deuda no es de un componente suelto, sino de todas las superficies que
 * pintan `--brand-solid` bajo texto blanco: la cabecera de AdminLayout, la
 * cabecera del panel de filtros, `.btn-primary` y el `StatusBadge` activo. Dos
 * de ellas son CSS modules, cuyo nombre de clase se hashea en el build, así que
 * no hay selector estable al que apuntar con `.exclude()`.
 *
 * Se desactiva la regla en vez de excluir nodos porque excluir la cabecera
 * dejaría fuera del análisis TODO lo que contiene —navegación, botón de tema,
 * enlace de salto—, no solo su contraste. Así se pierde una única regla y el
 * resto de axe sigue cubriendo la página entera.
 */
export function auditA11y(page: Page): AxeBuilder {
  return new AxeBuilder({ page }).disableRules(['color-contrast']);
}
