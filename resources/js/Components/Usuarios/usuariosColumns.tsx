import type { ReactElement } from 'react';
import { StatusBadge } from '@Components/Common/StatusBadge';
import type { UsuarioRow } from '@Types/usuario';
import { formatDate } from '@Utils/date';

export interface UsuarioColumn {
  name: string;
  header: string;
  data: keyof UsuarioRow | null;
  orderable?: boolean;
  searchable?: boolean;
  /** Ancho fijo de la columna; la tabla usa `table-layout: fixed`. */
  width?: string;
  /** Trunca el texto largo con una elipsis y muestra el contenido completo en un tooltip. */
  ellipsis?: boolean;
  render?: (row: UsuarioRow) => ReactElement;
}

/**
 * Única fuente de verdad del listado: de aquí se derivan la cabecera `<thead>`,
 * la configuración `columns` de DataTables y sus `slots`, de modo que no puedan
 * desalinearse entre sí ni con el orden que interpreta el backend.
 */
// Las columnas sin `width` (nombre y email) se reparten el espacio sobrante: son
// las de texto más largo y las que se truncan con elipsis cuando no alcanza.
export const usuariosColumns: UsuarioColumn[] = [
  { name: 'nombre', header: 'Nombre completo', data: 'nombre_completo', ellipsis: true },
  { name: 'email', header: 'Email', data: 'email', ellipsis: true },
  { name: 'rut', header: 'RUT/RUN', data: 'rut', width: '8rem' },
  { name: 'rol', header: 'Rol', data: 'rol', orderable: false, width: '9rem', ellipsis: true },
  {
    name: 'estado',
    header: 'Estado',
    data: 'estado',
    width: '8rem',
    render: (row) => <StatusBadge estado={row.estado} />,
  },
  {
    name: 'created_at',
    header: 'Fecha creación',
    data: 'created_at',
    width: '9.5rem',
    render: (row) => <>{formatDate(row.created_at)}</>,
  },
];

export const ACCIONES_COLUMN: UsuarioColumn = {
  name: 'acciones',
  header: 'Acciones',
  data: null,
  orderable: false,
  searchable: false,
  width: '13rem',
};

/** Índice por el que se ordena por defecto (fecha de creación, descendente). */
export const DEFAULT_ORDER_INDEX = usuariosColumns.findIndex(
  (column) => column.name === 'created_at',
);
