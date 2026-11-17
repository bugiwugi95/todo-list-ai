/**
 * Due dates are stored as calendar days ("YYYY-MM-DD"), exactly what <input type="date">
 * produces. They are never converted to timestamps, so time zones cannot shift the day,
 * and two keys compare correctly as plain strings.
 */

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateKey(value: string): [year: number, month: number, day: number] | null {
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** True for a real calendar date in "YYYY-MM-DD" form (rejects e.g. 2026-02-30). */
export function isValidDueDate(value: string): boolean {
  const parts = parseDateKey(value);
  if (!parts) return false;
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** The user's local calendar day as "YYYY-MM-DD". */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isOverdue(dueDate: string | null, completed: boolean, today: string): boolean {
  return !completed && dueDate !== null && dueDate < today;
}

const sameYearFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const otherYearFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** Short human label: "сегодня", "21 нояб." or "3 мар. 2027 г.". */
export function formatDueDate(dueDate: string, today: string): string {
  if (dueDate === today) return 'сегодня';
  const parts = parseDateKey(dueDate);
  if (!parts) return dueDate;
  const [year, month, day] = parts;
  // Local midnight of that day, used only for formatting.
  const date = new Date(year, month - 1, day);
  const format = dueDate.slice(0, 4) === today.slice(0, 4) ? sameYearFormat : otherYearFormat;
  return format.format(date);
}
