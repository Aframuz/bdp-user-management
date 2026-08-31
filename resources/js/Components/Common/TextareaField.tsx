import { Form } from 'react-bootstrap';
import { FieldWrapper, type FieldProps } from './FieldWrapper';
import styles from './FormControls.module.css';

interface TextareaFieldProps extends FieldProps {
  defaultValue?: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}

export function TextareaField({
  defaultValue,
  rows = 4,
  maxLength,
  placeholder,
  ...field
}: TextareaFieldProps) {
  return (
    <FieldWrapper {...field}>
      {(controlProps) => (
        <Form.Control
          {...controlProps}
          as="textarea"
          className={`${styles['form-control']} ${styles['form-control--textarea']}`}
          defaultValue={defaultValue}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={rows}
        />
      )}
    </FieldWrapper>
  );
}
