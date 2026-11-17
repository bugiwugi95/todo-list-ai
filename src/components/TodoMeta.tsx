import type { Todo } from '../types';
import { DEFAULT_DETAILS, PRIORITY_LABELS } from '../lib/todos';
import { formatDueDate, isOverdue, toDateKey } from '../lib/dueDate';

/** Secondary line under the title: non-default priority and due date. Renders nothing if empty. */
export function TodoMeta({ todo }: { todo: Todo }) {
  const showPriority = todo.priority !== DEFAULT_DETAILS.priority;
  if (!showPriority && todo.dueDate === null) return null;

  const today = toDateKey(new Date());
  const overdue = isOverdue(todo.dueDate, todo.completed, today);

  return (
    <p className="todo__meta">
      {showPriority && (
        <span className="todo__priority" data-priority={todo.priority}>
          {PRIORITY_LABELS[todo.priority]} приоритет
        </span>
      )}
      {todo.dueDate !== null && (
        <span className="todo__due" data-overdue={overdue}>
          {overdue ? 'Просрочено: ' : 'Срок: '}
          <time dateTime={todo.dueDate}>{formatDueDate(todo.dueDate, today)}</time>
        </span>
      )}
    </p>
  );
}
