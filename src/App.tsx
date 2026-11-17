import { useCallback, useEffect, useRef, useState } from 'react';
import type { Filter, Todo } from './types';
import { useTodos, type RemovedTodo } from './hooks/useTodos';
import { matchesFilter, plural } from './lib/todos';
import { TodoForm } from './components/TodoForm';
import { FilterBar } from './components/FilterBar';
import { TodoItem, checkboxId } from './components/TodoItem';
import { EmptyState } from './components/EmptyState';
import { Toast, type ToastData } from './components/Toast';

const TASK_FORMS = ['задача', 'задачи', 'задач'] as const;
const ACTIVE_FORMS = ['активная', 'активные', 'активных'] as const;

function getSummary(active: number, total: number): string {
  if (total === 0) return 'Список пуст';
  if (active === 0) return 'Все задачи выполнены';
  return `${active} ${plural(active, ACTIVE_FORMS)} из ${total}`;
}

function isTextField(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && target.type === 'text';
}

export function App() {
  const { todos, counts, add, toggle, rename, remove, clearCompleted, restore } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const toastCounter = useRef(0);
  // Where keyboard focus should go after the next render: a todo id or the new-task input.
  const pendingFocus = useRef<string | null>(null);

  const visibleTodos = todos.filter((todo) => matchesFilter(todo, filter));

  useEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    const element =
      target === 'input' ? inputRef.current : document.getElementById(checkboxId(target));
    element?.focus();
  });

  const dismissToast = useCallback(() => setToast(null), []);

  function showToast(message: string, onUndo: (() => void) | null = null) {
    toastCounter.current += 1;
    setToast({ id: toastCounter.current, message, onUndo });
  }

  // Ctrl/Cmd+Z undoes the last action while its notification is visible.
  useEffect(() => {
    const undo = toast?.onUndo;
    if (!undo) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'z' || !(event.ctrlKey || event.metaKey)) return;
      if (event.shiftKey || isTextField(event.target)) return;
      event.preventDefault();
      undo?.();
      setToast(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toast]);

  /** Before a row leaves the visible list, move focus to its neighbour instead of losing it. */
  function focusNeighbourOf(id: string) {
    const index = visibleTodos.findIndex((todo) => todo.id === id);
    const neighbour = visibleTodos[index + 1] ?? visibleTodos[index - 1];
    pendingFocus.current = neighbour ? neighbour.id : 'input';
  }

  function handleAdd(title: string) {
    const todo = add(title);
    if (filter === 'completed') setFilter('all');
    setHighlightedId(todo.id);
    setAnnouncement(`Добавлено: ${title}`);
  }

  function handleToggle(todo: Todo) {
    const updated = { ...todo, completed: !todo.completed };
    toggle(todo.id);
    if (!matchesFilter(updated, filter)) {
      // The row disappears from the current view, so say where it went and allow undo.
      focusNeighbourOf(todo.id);
      showToast(updated.completed ? 'Задача выполнена' : 'Задача снова активна', () =>
        toggle(todo.id),
      );
    }
  }

  function handleRename(id: string, title: string) {
    rename(id, title);
    setHighlightedId(id);
    setAnnouncement('Изменения сохранены');
  }

  function handleRestore(entries: RemovedTodo[]) {
    restore(entries);
    if (entries.length === 1 && entries[0]) setHighlightedId(entries[0].todo.id);
  }

  function handleDelete(id: string) {
    focusNeighbourOf(id);
    const removed = remove(id);
    if (removed) showToast('Задача удалена', () => handleRestore([removed]));
  }

  function handleClearCompleted() {
    const removed = clearCompleted();
    if (removed.length === 0) return;
    pendingFocus.current = 'input';
    const label = `${removed.length} ${plural(removed.length, ['выполненная задача', 'выполненные задачи', 'выполненных задач'])}`;
    showToast(`Удалено: ${label}`, () => handleRestore(removed));
  }

  return (
    <>
      <main className="app">
        <header className="app__header">
          <h1 className="app__title">Мои задачи</h1>
          <p className="app__summary">{getSummary(counts.active, counts.all)}</p>
        </header>

        <TodoForm ref={inputRef} onAdd={handleAdd} />

        <section className="tasks" aria-labelledby="tasks-title">
          <h2 id="tasks-title" className="visually-hidden">
            Список задач
          </h2>

          {counts.all > 0 && <FilterBar value={filter} onChange={setFilter} counts={counts} />}

          <div className="tasks__panel">
            {visibleTodos.length > 0 ? (
              <ul className="todo-list">
                {visibleTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    highlighted={todo.id === highlightedId}
                    onToggle={handleToggle}
                    onRename={handleRename}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState filter={filter} hasTodos={counts.all > 0} />
            )}

            {counts.all > 0 && (
              <footer className="tasks__footer">
                <p className="tasks__count">
                  {counts.active === 0
                    ? 'Всё выполнено'
                    : `Осталось ${counts.active} ${plural(counts.active, TASK_FORMS)}`}
                </p>
                {counts.completed > 0 && (
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={handleClearCompleted}
                  >
                    Очистить выполненные
                  </button>
                )}
              </footer>
            )}
          </div>
        </section>
      </main>

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
