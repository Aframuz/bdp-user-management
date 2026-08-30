import type { ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import { FieldWrapper, type FieldProps } from './FieldWrapper';
import styles from './FormControls.module.css';

interface TextareaFieldProps extends FieldProps {
    value: string;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
    rows?: number;
    maxLength?: number;
    placeholder?: string;
}

export function TextareaField({ value, onChange, rows = 4, maxLength, placeholder, ...field }: TextareaFieldProps) {
    return (
        <FieldWrapper {...field}>
            {(controlProps) => (
                <Form.Control
                    {...controlProps}
                    as="textarea"
                    className={`${styles['form-control']} ${styles['form-control--textarea']}`}
                    maxLength={maxLength}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    value={value}
                />
            )}
        </FieldWrapper>
    );
}
