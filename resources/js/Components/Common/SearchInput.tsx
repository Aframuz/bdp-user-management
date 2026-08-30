import { Form, InputGroup } from 'react-bootstrap';
import { SearchIcon } from './Icons';
import formStyles from './FormControls.module.css';
import styles from './SearchInput.module.css';

interface SearchInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchInput({ id, label, value, onChange, placeholder }: SearchInputProps) {
    return (
        <Form.Group className={`${styles['search-input']} w-100`} controlId={id}>
            <Form.Label className="d-block small fw-bold text-body-secondary">{label}</Form.Label>
            <InputGroup>
                <InputGroup.Text aria-hidden="true"><SearchIcon /></InputGroup.Text>
                <Form.Control
                    className={formStyles['form-control']}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    type="search"
                    value={value}
                />
            </InputGroup>
        </Form.Group>
    );
}
