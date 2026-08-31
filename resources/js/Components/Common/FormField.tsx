import type { ChangeEventHandler, FocusEventHandler, InputHTMLAttributes } from 'react';
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
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
}

export function FormField({
  defaultValue,
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  inputMode,
  maxLength,
  pattern,
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
          inputMode={inputMode}
          maxLength={maxLength}
          onBlur={onBlur}
          onChange={onChange}
          pattern={pattern}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      )}
    </FieldWrapper>
  );
}
