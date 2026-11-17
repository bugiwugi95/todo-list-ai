import type { Filter, Todo } from '../types';

export const MAX_TITLE_LENGTH = 200;

/** Trims the title and collapses inner whitespace; an empty result means "invalid". */
export function normalizeTitle(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** A normalized title is valid when it is non-empty and fits the length limit. */
export function isValidTitle(title: string): boolean {
  return title.length > 0 && title.length <= MAX_TITLE_LENGTH;
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
