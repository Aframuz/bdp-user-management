type SweetAlert = typeof import('sweetalert2')['default'];

const DESKTOP_MIN_WIDTH = 1024;
const NOTICE_STORAGE_KEY = 'bolsa-productos-desktop-notice-shown';

let noticeShownInMemory = false;
let sweetAlertPromise: Promise<SweetAlert> | null = null;

function reserveNotice(): boolean {
    if (noticeShownInMemory) {
        return false;
    }

    try {
        if (window.sessionStorage.getItem(NOTICE_STORAGE_KEY) === 'true') {
            return false;
        }

        window.sessionStorage.setItem(NOTICE_STORAGE_KEY, 'true');
    } catch {
        // El aviso sigue mostrándose una vez mientras viva la página si el storage no está disponible.
    }

    noticeShownInMemory = true;

    return true;
}

function getSweetAlert(): Promise<SweetAlert> {
    sweetAlertPromise ??= Promise.all([
        import('sweetalert2'),
        import('sweetalert2/dist/sweetalert2.min.css'),
    ]).then(([{ default: Swal }]) => Swal);

    return sweetAlertPromise;
}

/** Recomienda un viewport de escritorio una sola vez por pestaña. */
export function showDesktopNotice(): void {
    if (typeof window === 'undefined' || window.innerWidth >= DESKTOP_MIN_WIDTH || !reserveNotice()) {
        return;
    }

    void getSweetAlert().then((Swal) => Swal.fire({
        icon: 'info',
        title: 'Mejor experiencia en escritorio',
        text: 'Para aprovechar mejor el panel de administración, te recomendamos abrirlo desde un computador con una pantalla de al menos 1024 px de ancho.',
        confirmButtonText: 'Entendido',
        customClass: { popup: 'app-desktop-notice' },
    }));
}
