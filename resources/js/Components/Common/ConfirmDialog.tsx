import { useId, type ReactNode } from 'react';
import { Button, Modal } from 'react-bootstrap';

interface ConfirmDialogProps {
    show: boolean;
    title: string;
    children: ReactNode;
    confirmLabel: string;
    /** Etiqueta mientras la acción está en curso. */
    pendingLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
    pending?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/** Modal de confirmación genérico para cualquier acción irreversible. */
export function ConfirmDialog({
    show,
    title,
    children,
    confirmLabel,
    pendingLabel,
    cancelLabel = 'Cancelar',
    variant = 'danger',
    pending = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const titleId = useId();

    return (
        <Modal aria-labelledby={titleId} centered onHide={() => !pending && onCancel()} show={show}>
            <Modal.Header closeButton={!pending} closeLabel="Cerrar diálogo">
                <Modal.Title as="h2" className="h5" id={titleId}>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer>
                <Button disabled={pending} onClick={onCancel} variant="outline-secondary">{cancelLabel}</Button>
                <Button disabled={pending} onClick={onConfirm} variant={variant}>
                    {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
