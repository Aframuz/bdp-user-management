import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ServerErrorPanel } from '@Components/Common/ServerErrorPanel';

describe('ServerErrorPanel', () => {
    it('explains the error without exposing technical details', () => {
        render(<ServerErrorPanel ruta="/usuarios/asdf" />);

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('No pudimos completar la solicitud');
        expect(screen.getByRole('link', { name: 'Ir a Usuarios' })).toHaveAttribute('href', '/usuarios');
        expect(screen.getByText('/usuarios/asdf')).toBeInTheDocument();
        expect(screen.queryByText(/SQLSTATE|bigint/i)).not.toBeInTheDocument();
    });
});
