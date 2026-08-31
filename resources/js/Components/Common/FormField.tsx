import type { ChangeEventHandler, FocusEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import { FieldWrapper, type FieldProps } from './FieldWrapper';
import styles from './FormControls.module.css';

interface FormFieldProps extends FieldProps {
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
}

export function FormField({
  defaultValue,
  value,
  onChange,
  onBlur,
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
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      )}
    </FieldWrapper>
  );
}
