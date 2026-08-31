const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeZone: 'America/Santiago',
});

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Sin información';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha inválida' : dateFormatter.format(date);
}
