import type { ReactNode } from 'react';
import { Form } from 'react-bootstrap';

export interface FieldProps {
    /** Coincide con el nombre del campo en el backend: identifica el control, su `name` y su error. */
    id: string;
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
}

interface FieldWrapperProps extends FieldProps {
    /** Recibe el cableado de accesibilidad ya resuelto para aplicarlo al control. */
    children: (controlProps: {
        'aria-describedby': string | undefined;
        'aria-invalid': boolean;
        'data-field': string;
        isInvalid: boolean;
        name: string;
        required: boolean;
    }) => ReactNode;
}

/**
 * Contrato común de label, marca de obligatorio, ayuda y error de todos los campos.
 * Centralizarlo garantiza que cada control tenga el mismo cableado accesible.
 */
export function FieldWrapper({ id, label, error, required = false, hint, children }: FieldWrapperProps) {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

    return (
        <Form.Group controlId={id}>
            <Form.Label className="small fw-bold text-body-secondary">
                {label}
                {required && <span aria-hidden="true" className="text-danger"> *</span>}
            </Form.Label>
            {children({
                'aria-describedby': describedBy,
                'aria-invalid': Boolean(error),
                'data-field': id,
                isInvalid: Boolean(error),
                name: id,
                required,
            })}
            {hint && !error && <Form.Text id={hintId}>{hint}</Form.Text>}
            {error && <Form.Control.Feedback id={errorId} type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>
    );
}
