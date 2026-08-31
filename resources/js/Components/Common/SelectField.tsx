import { Form } from 'react-bootstrap';
import { FieldWrapper, type FieldProps } from './FieldWrapper';
import styles from './FormControls.module.css';

interface SelectFieldProps extends FieldProps {
  defaultValue?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder: string;
}

export function SelectField({ defaultValue, options, placeholder, ...field }: SelectFieldProps) {
  return (
    <FieldWrapper {...field}>
      {(controlProps) => (
        <Form.Select
          className={styles['form-control']}
          {...controlProps}
          defaultValue={defaultValue}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      )}
    </FieldWrapper>
  );
}
