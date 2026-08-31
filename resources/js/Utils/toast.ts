type SweetAlert = (typeof import('sweetalert2'))['default'];

export type ToastVariant = 'success' | 'error';

/** Mismo tiempo en pantalla que tenía el toast de Bootstrap al que reemplaza. */
const TOAST_DELAY = 4500;

const HEADINGS: Record<ToastVariant, string> = {
  success: 'Operación exitosa',
  error: 'Ocurrió un error',
};

let toastPromise: Promise<SweetAlert> | null = null;

// SweetAlert solo se necesita cuando el backend envía un flash. Mantener su JS y CSS
// fuera del entry compartido evita pagarlos en cada carga y conserva una sola instancia.
function getToast(): Promise<SweetAlert> {
  toastPromise ??= Promise.all([
    import('sweetalert2'),
    import('sweetalert2/dist/sweetalert2.min.css'),
  ]).then(([{ default: Swal }]) =>
    Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      showCloseButton: true,
      closeButtonAriaLabel: 'Cerrar notificación',
      timer: TOAST_DELAY,
      timerProgressBar: true,
      // El temporizador se congela mientras el puntero esté encima: da tiempo a leer
      // el mensaje y a alcanzar el botón de cierre sin que se escape a medio camino.
      didOpen: (popup) => {
        popup.addEventListener('mouseenter', Swal.stopTimer);
        popup.addEventListener('mouseleave', Swal.resumeTimer);
      },
    }),
  );

  return toastPromise;
}

/**
 * Muestra un toast. Solo puede haber uno en pantalla: SweetAlert2 sustituye el
 * anterior, que es justo lo que se quiere para los flashes de una visita.
 */
export function showToast(variant: ToastVariant, message: string): void {
  void getToast().then((toast) =>
    toast.fire({
      icon: variant,
      title: HEADINGS[variant],
      text: message,
      customClass: { popup: `app-toast app-toast--${variant}` },
    }),
  );
}
