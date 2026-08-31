/**
 * Etiqueta visible de cada campo. La pinta el `<label>` del formulario y la usa el
 * resumen para nombrar un campo con error, así que sale de un único sitio para que
 * las dos superficies no puedan llamar distinto a la misma cosa.
 */
export const USUARIO_CAMPOS = {
  nombre: 'Nombre',
  apellido: 'Apellido',
  email: 'Email',
  rut: 'RUT/RUN',
  rol_id: 'Rol',
  estado: 'Estado',
  telefono: 'Teléfono',
  calle: 'Calle',
  ciudad: 'Ciudad',
  codigo_postal: 'Código postal',
  nota: 'Nota',
} as const;

export type UsuarioCampo = keyof typeof USUARIO_CAMPOS;

export interface UsuarioFormSeccion {
  titulo: string;
  campos: readonly UsuarioCampo[];
}

/**
 * Reparto de campos por tarjeta. El formulario lo dibuja y `useUsuarioFormProgreso`
 * lo resume; el orden de las claves es el orden en que se recorren ambas cosas.
 */
export const USUARIO_FORM_SECCIONES = {
  'datos-personales': {
    titulo: 'Datos personales',
    campos: ['nombre', 'apellido', 'email', 'rut', 'rol_id', 'estado', 'telefono'],
  },
  direccion: {
    titulo: 'Dirección',
    campos: ['calle', 'ciudad', 'codigo_postal'],
  },
  nota: {
    titulo: 'Nota u observación',
    campos: ['nota'],
  },
} as const satisfies Record<string, UsuarioFormSeccion>;

export type UsuarioSeccionId = keyof typeof USUARIO_FORM_SECCIONES;
