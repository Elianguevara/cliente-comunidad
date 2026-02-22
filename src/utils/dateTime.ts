import { differenceInCalendarDays, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const parseBackendDate = (value: string | Date): Date | null => {
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  const raw = value.trim();
  if (!raw) return null;

  if (DATE_ONLY_REGEX.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return isValid(localDate) ? localDate : null;
  }

  const normalized = raw.includes(' ') && !raw.includes('T') ? raw.replace(' ', 'T') : raw;
  const parsed = parseISO(normalized);
  return isValid(parsed) ? parsed : null;
};

export const formatRelativePetitionDate = (value: string | Date): string => {
  const date = parseBackendDate(value);
  if (!date) return 'fecha no disponible';

  if (typeof value === 'string' && DATE_ONLY_REGEX.test(value.trim())) {
    const daysSince = differenceInCalendarDays(new Date(), date);
    if (daysSince <= 0) return 'hoy';
    if (daysSince === 1) return 'hace 1 dia';
    return `hace ${daysSince} dias`;
  }

  return formatDistanceToNow(date, { addSuffix: true, locale: es });
};
