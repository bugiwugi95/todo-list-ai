import type { Filter, Priority, Todo, TodoDetails } from '../types';
import { isValidDueDate } from './dueDate';

export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 1000;

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];

export const DEFAULT_DETAILS: TodoDetails = {
  description: '',
  priority: 'medium',
  dueDate: null,
};

/** Trims the title and collapses inner whitespace; an empty result means "invalid". */
export function normalizeTitle(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** A normalized title is valid when it is non-empty and fits the length limit. */
export function isValidTitle(title: string): boolean {
  return title.length > 0 && title.length <= MAX_TITLE_LENGTH;
}

/** Keeps line breaks (multi-line text) but trims the edges and unifies line endings. */
export function normalizeDescription(value: string): string {
  return value.replace(/\r\n?/g, '\n').trim();
}

export function isValidDescription(description: string): boolean {
  return description.length <= MAX_DESCRIPTION_LENGTH;
}

export function isPriority(value: unknown): value is Priority {
  return value === 'low' || value === 'medium' || value === 'high';
}

/** Normalizes user-entered details; returns null if any field is invalid. */
export function normalizeDetails(details: TodoDetails): TodoDetails | null {
  const description = normalizeDescription(details.description);
  if (!isValidDescription(description) || !isPriority(details.priority)) return null;
  if (details.dueDate !== null && !isValidDueDate(details.dueDate)) return null;
  return { description, priority: details.priority, dueDate: details.dueDate };
}

export function getDetails(todo: Todo): TodoDetails {
  return { description: todo.description, priority: todo.priority, dueDate: todo.dueDate };
}

export function matchesFilter(todo: Todo, filter: Filter): boolean {
  if (filter === 'active') return !todo.completed;
  if (filter === 'completed') return todo.completed;
  return true;
}

const pluralRules = new Intl.PluralRules('ru-RU');

/** Picks the Russian word form for a count: [one, few, many], e.g. задача / задачи / задач. */
export function plural(count: number, forms: readonly [string, string, string]): string {
  const rule = pluralRules.select(count);
  if (rule === 'one') return forms[0];
  if (rule === 'few') return forms[1];
  return forms[2];
}
