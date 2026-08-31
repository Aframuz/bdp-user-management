import { useMemo } from 'react';
import type { UsuarioFormData } from '@Types/usuario';
import { usuarioFormRules } from './usuarioFormRules';
import {
  USUARIO_CAMPOS,
  USUARIO_FORM_SECCIONES,
  type UsuarioCampo,
  type UsuarioSeccionId,
} from './usuarioFormSecciones';

export type EstadoSeccion = 'completa' | 'pendiente' | 'error';

export interface SeccionProgreso {
  id: UsuarioSeccionId;
  titulo: string;
  estado: EstadoSeccion;
  /** Frase corta que explica el estado: es la que lee quien no distingue el icono. */
  detalle: string;
}

export interface CampoConError {
  campo: UsuarioCampo;
  label: string;
}

export interface UsuarioFormProgreso {
  completos: number;
  total: number;
  porcentaje: number;
  secciones: SeccionProgreso[];
  errores: CampoConError[];
}

const CAMPOS = Object.keys(USUARIO_CAMPOS) as UsuarioCampo[];

const esObligatorio = (campo: UsuarioCampo) => usuarioFormRules[campo]?.required === true;

const estaVacio = (valores: Partial<UsuarioFormData>, campo: UsuarioCampo) =>
  String(valores[campo] ?? '').trim() === '';

/**
 * Traduce los valores y los errores vivos del formulario a lo que necesita el resumen:
 * cuánto queda por rellenar, en qué estado está cada tarjeta y qué campos hay que
 * corregir. Los errores mandan sobre lo que falte: un campo escrito pero rechazado
 * por el backend no cuenta como pendiente, cuenta como error.
 */
export function useUsuarioFormProgreso(
  valores: Partial<UsuarioFormData>,
  errors: Record<string, string | undefined>,
): UsuarioFormProgreso {
  return useMemo(() => {
    const completos = CAMPOS.filter((campo) => !estaVacio(valores, campo)).length;

    const errores = CAMPOS.filter((campo) => Boolean(errors[campo])).map((campo) => ({
      campo,
      label: USUARIO_CAMPOS[campo],
    }));

    const secciones = Object.entries(USUARIO_FORM_SECCIONES).map(([id, { titulo, campos }]) => {
      const conError = campos.filter((campo) => Boolean(errors[campo])).length;

      if (conError > 0) {
        return {
          id: id as UsuarioSeccionId,
          titulo,
          estado: 'error' as const,
          detalle: conError === 1 ? '1 campo con error' : `${conError} campos con error`,
        };
      }

      const faltan = campos.filter(
        (campo) => esObligatorio(campo) && estaVacio(valores, campo),
      ).length;

      return {
        id: id as UsuarioSeccionId,
        titulo,
        estado: faltan > 0 ? ('pendiente' as const) : ('completa' as const),
        detalle:
          faltan === 0 ? 'Completa' : faltan === 1 ? 'Falta 1 campo' : `Faltan ${faltan} campos`,
      };
    });

    return {
      completos,
      total: CAMPOS.length,
      porcentaje: Math.round((completos / CAMPOS.length) * 100),
      secciones,
      errores,
    };
  }, [errors, valores]);
}
