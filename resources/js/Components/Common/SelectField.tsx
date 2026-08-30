import type { ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import { FieldWrapper, type FieldProps } from './FieldWrapper';
import styles from './FormControls.module.css';

interface SelectFieldProps extends FieldProps {
    value: string;
    onChange: ChangeEventHandler<HTMLSelectElement>;
    options: ReadonlyArray<{ value: string; label: string }>;
    /** Opción neutra inicial; con `value=""` actúa como «sin selección». */
    placeholder: string;
}

export function SelectField({ value, onChange, options, placeholder, ...field }: SelectFieldProps) {
    return (
        <FieldWrapper {...field}>
            {(controlProps) => (
                <Form.Select className={styles['form-control']} {...controlProps} onChange={onChange} value={value}>
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Form.Select>
            )}
        </FieldWrapper>
    );
}
