import { ErrorPanel } from '@Components/Common/ErrorPanel';

/** Cuerpo de la página 500, separado del layout para poder probarlo aisladamente. */
export function ServerErrorPanel({ ruta }: { ruta?: string }) {
  return (
    <ErrorPanel
      code="500"
      description="El panel encontró un problema inesperado al procesar esta solicitud. Vuelve al listado de usuarios e inténtalo nuevamente."
      ruta={ruta}
      title="No pudimos completar la solicitud"
    />
  );
}
