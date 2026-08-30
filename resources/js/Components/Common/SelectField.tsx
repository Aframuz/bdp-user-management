import { Form } from 'react-bootstrap';
import { FieldWrapper, type FieldProps } from './FieldWrapper';
import styles from './FormControls.module.css';

interface SelectFieldProps extends FieldProps {
    /** El control es no controlado: su valor lo lee el `<Form>` de Inertia desde el DOM al enviar. */
    defaultValue?: string;
    options: ReadonlyArray<{ value: string; label: string }>;
    /** Opción neutra inicial; con `value=""` actúa como «sin selección». */
    placeholder: string;
}

export function SelectField({ defaultValue, options, placeholder, ...field }: SelectFieldProps) {
    return (
        <FieldWrapper {...field}>
            {(controlProps) => (
                <Form.Select className={styles['form-control']} {...controlProps} defaultValue={defaultValue}>
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Form.Select>
            )}
        </FieldWrapper>
    );
}
