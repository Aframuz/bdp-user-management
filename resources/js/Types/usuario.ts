export interface RoleOption {
  id: number;
  nombre: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface UsuarioRow {
  id: number;
  nombre_completo: string;
  email: string;
  rut: string;
  rol: string;
  estado: 'activo' | 'inactivo';
  created_at: string;
}

export interface UsuarioSummary {
  id: number;
  nombre_completo: string;
  email: string;
  rol: string;
  estado: 'activo' | 'inactivo';
}

export interface UsuarioGeneral {
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  telefono: string | null;
  rol: string;
  estado: 'activo' | 'inactivo';
  created_at: string;
}

export interface Direccion {
  id: number;
  calle: string;
  ciudad: string;
  codigo_postal: string | null;
}

export interface Nota {
  id: number;
  texto: string;
  created_at: string;
}

export const USER_TABS = ['general', 'direcciones', 'notas'] as const;
export type UserTab = (typeof USER_TABS)[number];

export interface UsuarioFormData {
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  telefono: string;
  rol_id: string;
  estado: string;
  calle: string;
  ciudad: string;
  codigo_postal: string;
  nota: string;
  [key: string]: string;
}
