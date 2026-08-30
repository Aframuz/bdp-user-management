import { Form } from 'react-bootstrap';
import { FieldWrapper, type FieldProps } from './FieldWrapper';
import styles from './FormControls.module.css';

interface FormFieldProps extends FieldProps {
    /** El control es no controlado: su valor lo lee el `<Form>` de Inertia desde el DOM al enviar. */
    defaultValue?: string;
    type?: string;
    autoComplete?: string;
    maxLength?: number;
    placeholder?: string;
}

export function FormField({
    defaultValue,
    type = 'text',
    autoComplete,
    maxLength,
    placeholder,
    ...field
}: FormFieldProps) {
    return (
        <FieldWrapper {...field}>
            {(controlProps) => (
                <Form.Control
                    {...controlProps}
                    autoComplete={autoComplete}
                    className={styles['form-control']}
                    defaultValue={defaultValue}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    type={type}
                />
            )}
        </FieldWrapper>
    );
}
