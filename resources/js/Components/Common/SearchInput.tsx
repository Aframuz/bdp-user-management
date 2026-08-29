import { Form, InputGroup } from 'react-bootstrap';
import { SearchIcon } from './Icons';

interface SearchInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchInput({ id, label, value, onChange, placeholder }: SearchInputProps) {
    return (
        <Form.Group className="search-field" controlId={id}>
            <Form.Label>{label}</Form.Label>
            <InputGroup>
                <InputGroup.Text aria-hidden="true"><SearchIcon /></InputGroup.Text>
                <Form.Control
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    type="search"
                    value={value}
                />
            </InputGroup>
        </Form.Group>
    );
}
