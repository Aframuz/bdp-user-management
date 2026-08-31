import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UsuarioFormBody } from '@Components/Usuarios/UsuarioFormBody';

describe('UsuarioFormBody', () => {
  function renderForm() {
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
  }

  it('exposes the shared length constraints on names and notes', () => {
    renderForm();

    const nombre = screen.getByLabelText(/Nombre/);
    const apellido = screen.getByLabelText(/Apellido/);
    const nota = screen.getByLabelText(/Nota/);

    expect(nombre).toHaveAttribute('maxlength', '100');
    expect(apellido).toHaveAttribute('maxlength', '100');
    expect(nota).toHaveAttribute('maxlength', '1000');
    expect(nombre).toHaveAccessibleDescription('Máximo 100 caracteres.');
    expect(apellido).toHaveAccessibleDescription('Máximo 100 caracteres.');
    expect(nota).toHaveAccessibleDescription('Máximo 1000 caracteres.');
  });

  it('exposes only the configured character restrictions', () => {
    renderForm();

    const lettersPattern = String.raw`^[\p{L}\p{M} ]+$`;
    expect(screen.getByLabelText(/Nombre/)).toHaveAttribute('pattern', lettersPattern);
    expect(screen.getByLabelText(/Apellido/)).toHaveAttribute('pattern', lettersPattern);
    expect(screen.getByLabelText(/Calle/)).not.toHaveAttribute('pattern');
    expect(screen.getByLabelText(/Ciudad/)).toHaveAttribute('pattern', lettersPattern);

    const postalCode = screen.getByLabelText(/Código postal/);
    expect(postalCode).toHaveAttribute('pattern', String.raw`^\d+$`);
    expect(postalCode).toHaveAttribute('inputmode', 'numeric');
  });
});
