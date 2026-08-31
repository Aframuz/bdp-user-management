/**
 * Serializa un objeto anidado al formato `campo[0][clave]=valor` que usa
 * DataTables en su protocolo server-side y que Laravel sabe reconstruir.
 * Hace falta porque la tabla envía sus peticiones con `fetch` en lugar de
 * delegarlas en el transporte interno de DataTables.
 */
export function buildQuery(source: Record<string, unknown>): string {
  const params = new URLSearchParams();
  appendParam(params, '', source);

  return params.toString();
}

function appendParam(params: URLSearchParams, prefix: string, value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => appendParam(params, `${prefix}[${index}]`, item));
    return;
  }

  if (value !== null && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) =>
      appendParam(params, prefix ? `${prefix}[${key}]` : key, item),
    );
    return;
  }

  if (value !== undefined) params.append(prefix, String(value));
}
