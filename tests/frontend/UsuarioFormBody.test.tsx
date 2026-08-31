import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UsuarioFormBody } from '@Components/Usuarios/UsuarioFormBody';

describe('UsuarioFormBody', () => {
  it('exposes the character restrictions on the corresponding inputs', () => {
    render(
      <UsuarioFormBody
        errors={{}}
        estados={[{ value: 'activo', label: 'Activo' }]}
        hasErrors={false}
        processing={false}
        roleOptions={[{ value: '1', label: 'Admin' }]}
        setRutValido={vi.fn()}
        setTelefonoValido={vi.fn()}
        valores={{}}
      />,
    );

    const lettersPattern = String.raw`^[\p{L}\p{M} ]+$`;
    expect(screen.getByLabelText(/Nombre/)).toHaveAttribute('pattern', lettersPattern);
    expect(screen.getByLabelText(/Apellido/)).toHaveAttribute('pattern', lettersPattern);
    expect(screen.getByLabelText(/Calle/)).toHaveAttribute('pattern', lettersPattern);
    expect(screen.getByLabelText(/Ciudad/)).toHaveAttribute('pattern', lettersPattern);

    const postalCode = screen.getByLabelText(/Código postal/);
    expect(postalCode).toHaveAttribute('pattern', String.raw`^\d+$`);
    expect(postalCode).toHaveAttribute('inputmode', 'numeric');
  });
});
