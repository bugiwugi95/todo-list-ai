import type { Todo, TodoDetails } from './types';
import {
  DEFAULT_DETAILS,
  isPriority,
  isValidDescription,
  isValidTitle,
  normalizeDescription,
  normalizeTitle,
} from './lib/todos';
import { isValidDueDate } from './lib/dueDate';

const STORAGE_KEY = 'todo-list-ai:todos';

/** Fields every saved todo must have; older records contain only these. */
type StoredTodo = Pick<Todo, 'id' | 'title' | 'completed' | 'createdAt'> & Record<string, unknown>;

function isStoredTodo(value: unknown): value is StoredTodo {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.title === 'string' &&
    isValidTitle(normalizeTitle(item.title)) &&
    typeof item.completed === 'boolean' &&
    typeof item.createdAt === 'number' &&
    Number.isFinite(item.createdAt)
  );
}

/**
 * Optional fields fall back to defaults when missing or invalid, so records saved
 * before these fields existed (or with a broken value) still load.
 */
function readDetails(item: StoredTodo): TodoDetails {
  const description =
    typeof item.description === 'string' ? normalizeDescription(item.description) : '';
  return {
    description: isValidDescription(description) ? description : DEFAULT_DETAILS.description,
    priority: isPriority(item.priority) ? item.priority : DEFAULT_DETAILS.priority,
    dueDate:
      typeof item.dueDate === 'string' && isValidDueDate(item.dueDate)
        ? item.dueDate
        : DEFAULT_DETAILS.dueDate,
  };
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
    if (!isStoredTodo(item) || seen.has(item.id)) continue;
    seen.add(item.id);
    todos.push({
      id: item.id,
      title: normalizeTitle(item.title),
      ...readDetails(item),
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
