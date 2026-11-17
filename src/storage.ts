import type { Todo } from './types';

const STORAGE_KEY = 'todo-list-ai:todos';

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.title === 'string' &&
    item.title.trim().length > 0 &&
    typeof item.completed === 'boolean' &&
    typeof item.createdAt === 'number' &&
    Number.isFinite(item.createdAt)
  );
}

/**
 * Reads todos from localStorage. Anything that cannot be parsed or does not
 * match the Todo shape is discarded, so a corrupted value never breaks the app.
 */
export function loadTodos(): Todo[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn('Saved todos are not valid JSON and were ignored.');
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const seen = new Set<string>();
  const todos: Todo[] = [];
  for (const item of parsed) {
    if (!isTodo(item) || seen.has(item.id)) continue;
    seen.add(item.id);
    todos.push({
      id: item.id,
      title: item.title.trim(),
      completed: item.completed,
      createdAt: item.createdAt,
    });
  }
  return todos;
}

export function saveTodos(todos: Todo[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Storage can be full or unavailable (e.g. private mode); the app keeps working in memory.
  }
}
