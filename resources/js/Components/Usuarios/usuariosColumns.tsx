import type { ReactElement } from 'react';
import { StatusBadge } from '../Common/StatusBadge';
import type { UsuarioRow } from '../../Types/usuario';
import { formatDate } from '../../Utils/date';

export interface UsuarioColumn {
    /** Nombre lógico enviado a DataTables; el backend ordena por él, no por posición. */
    name: string;
    header: string;
    /** Clave del dato en la fila; `null` para columnas calculadas como Acciones. */
    data: keyof UsuarioRow | null;
    orderable?: boolean;
    searchable?: boolean;
    /** Render personalizado de la celda. Sin él, DataTables pinta el valor crudo. */
    render?: (row: UsuarioRow) => ReactElement;
}

/**
 * Única fuente de verdad del listado: de aquí se derivan la cabecera `<thead>`,
 * la configuración `columns` de DataTables y sus `slots`, de modo que no puedan
 * desalinearse entre sí ni con el orden que interpreta el backend.
 */
export const usuariosColumns: UsuarioColumn[] = [
    { name: 'nombre', header: 'Nombre completo', data: 'nombre_completo' },
    { name: 'email', header: 'Email', data: 'email' },
    { name: 'rut', header: 'RUT/RUN', data: 'rut' },
    { name: 'rol', header: 'Rol', data: 'rol', orderable: false },
    { name: 'estado', header: 'Estado', data: 'estado', render: (row) => <StatusBadge estado={row.estado} /> },
    { name: 'created_at', header: 'Fecha creación', data: 'created_at', render: (row) => <>{formatDate(row.created_at)}</> },
];

export const ACCIONES_COLUMN: UsuarioColumn = {
    name: 'acciones',
    header: 'Acciones',
    data: null,
    orderable: false,
    searchable: false,
};

/** Índice por el que se ordena por defecto (fecha de creación, descendente). */
export const DEFAULT_ORDER_INDEX = usuariosColumns.findIndex((column) => column.name === 'created_at');
