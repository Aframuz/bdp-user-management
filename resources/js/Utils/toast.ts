import Swal from 'sweetalert2';

export type ToastVariant = 'success' | 'error';

/** Mismo tiempo en pantalla que tenía el toast de Bootstrap al que reemplaza. */
const TOAST_DELAY = 4500;

const HEADINGS: Record<ToastVariant, string> = {
    success: 'Operación exitosa',
    error: 'Ocurrió un error',
};

// Configuración común: esquina superior derecha, sin botón de confirmar y con
// autocierre visible. El aspecto se ajusta a los tokens de la app en `app.css`
// a través de la clase `app-toast`.
const toast = Swal.mixin({
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
});

/**
 * Muestra un toast. Solo puede haber uno en pantalla: SweetAlert2 sustituye el
 * anterior, que es justo lo que se quiere para los flashes de una visita.
 */
export function showToast(variant: ToastVariant, message: string): void {
    void toast.fire({
        icon: variant,
        title: HEADINGS[variant],
        text: message,
        customClass: { popup: `app-toast app-toast--${variant}` },
    });
}
