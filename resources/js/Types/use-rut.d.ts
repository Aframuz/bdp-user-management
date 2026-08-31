/**
 * `use-rut` no publica tipos. El hook devuelve el RUT ya formateado, si el dígito
 * verificador cuadra, y el setter que recibe el valor crudo tecleado por el usuario.
 */
declare module 'use-rut' {
  export default function useRut(): [string, boolean, (value: string) => void];
}
