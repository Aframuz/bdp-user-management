export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    /** Cambia con cada mensaje, incluso si el texto se repite. */
    id?: string | null;
}

export interface SharedPageProps {
    flash: FlashMessages;
    [key: string]: unknown;
}
