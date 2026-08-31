/**
 * Coreografía de las filas del listado cuando cambian los criterios: las que el
 * nuevo resultado deja fuera se desvanecen *antes* de redibujar, las que
 * sobreviven se deslizan desde su posición anterior hasta la nueva (técnica
 * FLIP) y las que entran aparecen cuando el resto ya se ha asentado.
 *
 * Se trabaja directamente sobre el DOM porque DataTables destruye y recrea los
 * `<tr>` en cada dibujado: React no reconcilia esas filas, así que no puede
 * conservarlas ni animarlas por nosotros. El desplazamiento de las filas
 * supervivientes es lo que da la sensación de que las filas descartadas
 * «colapsan», sin necesidad de animar la altura de un `<tr>` (que los
 * navegadores tratan como mínimo y no como una medida animable).
 */

export interface TableRow {
  id: number;
  node: HTMLElement;
}

const EXIT_MS = 140;
const MOVE_MS = 300;
const ENTER_MS = 240;
const STAGGER_MS = 30;
/** Tope de filas escalonadas: con 10 por página, más retardo ya se percibe lento. */
const MAX_STAGGERED = 5;
const MOVE_EASING = 'cubic-bezier(.22, .61, .36, 1)';
/** Desplazamiento menor que un píxel: no se ve, no merece una animación. */
const MIN_OFFSET_PX = 1;

const staggerFor = (index: number) => Math.min(index, MAX_STAGGERED) * STAGGER_MS;

/** Sin Web Animations, o con «reducir movimiento» activo, todo ocurre al instante. */
function animationsEnabled(): boolean {
  if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function')
    return false;

  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Posición vertical de cada fila, para calcular después cuánto se ha movido. */
export function snapshotRowPositions(rows: TableRow[]): Map<number, number> {
  return new Map(rows.map(({ id, node }) => [id, node.getBoundingClientRect().top]));
}

/**
 * Desvanece las filas que el nuevo resultado ya no incluye. Resuelve al
 * terminar, de modo que el redibujado ocurra con esas filas ya invisibles y el
 * relevo entre el DOM viejo y el nuevo no se note.
 */
export function fadeOutRows(nodes: HTMLElement[]): Promise<void> {
  if (!nodes.length || !animationsEnabled()) return Promise.resolve();

  const animations = nodes.map((node) =>
    node.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-4px)' }], {
      duration: EXIT_MS,
      easing: 'ease-in',
      fill: 'forwards',
    }),
  );

  // Un fallo de la animación no puede dejar la tabla sin redibujar.
  return Promise.all(animations.map((animation) => animation.finished)).then(
    () => undefined,
    () => undefined,
  );
}

/**
 * Anima las filas recién dibujadas contra el estado anterior: las que ya
 * estaban parten de donde estaban y se deslizan a su nueva posición; las que no
 * estaban aparecen con un fundido escalonado, ya con el hueco hecho.
 *
 * `previousPositions` es `null` en el primer dibujado de la tabla: ahí no hay
 * ningún cambio que comunicar y animar contenido que nunca estuvo en pantalla
 * solo retrasa su lectura (y hace que las herramientas de accesibilidad midan
 * el contraste sobre filas a medio fundido).
 */
export function animateRowsIn(
  rows: TableRow[],
  previousPositions: Map<number, number> | null,
): void {
  if (!rows.length || !previousPositions || !animationsEnabled()) return;

  // Se miden todas las posiciones antes de animar: alternar lecturas de layout
  // con la creación de animaciones fuerza reflows innecesarios.
  const positions = snapshotRowPositions(rows);
  // Si no quedaba ninguna fila que reubicar, las nuevas entran de inmediato.
  const enterDelay = previousPositions.size === 0 ? 0 : Math.round(MOVE_MS * 0.45);
  let entering = 0;

  rows.forEach(({ id, node }) => {
    const previousTop = previousPositions.get(id);

    if (previousTop === undefined) {
      node.animate(
        [
          { opacity: 0, transform: 'translateY(-6px)' },
          { opacity: 1, transform: 'none' },
        ],
        {
          duration: ENTER_MS,
          delay: enterDelay + staggerFor(entering++),
          easing: 'ease-out',
          // `backwards` mantiene la fila oculta durante la espera.
          fill: 'backwards',
        },
      );
      return;
    }

    const offset = previousTop - (positions.get(id) ?? previousTop);
    if (Math.abs(offset) < MIN_OFFSET_PX) return;

    node.animate([{ transform: `translateY(${offset}px)` }, { transform: 'none' }], {
      duration: MOVE_MS,
      easing: MOVE_EASING,
    });
  });
}
