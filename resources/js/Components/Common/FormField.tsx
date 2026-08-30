import type { ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import { FieldWrapper, type FieldProps } from './FieldWrapper';
import styles from './FormControls.module.css';

interface FormFieldProps extends FieldProps {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    type?: string;
    autoComplete?: string;
    maxLength?: number;
    placeholder?: string;
}

export function FormField({
    value,
    onChange,
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
                    maxLength={maxLength}
                    onChange={onChange}
                    placeholder={placeholder}
                    type={type}
                    value={value}
                />
            )}
        </FieldWrapper>
    );
}
