import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import type { Todo, TodoDetails } from '../types';
import type { TodoChanges } from '../hooks/useTodos';
import {
  MAX_TITLE_LENGTH,
  getDetails,
  isValidTitle,
  normalizeDetails,
  normalizeTitle,
} from '../lib/todos';
import { iconProps } from '../icons';
import { TodoDetailsFields } from './TodoDetailsFields';
import { TodoMeta } from './TodoMeta';

interface TodoItemProps {
  todo: Todo;
  highlighted: boolean;
  onToggle: (todo: Todo) => void;
  onUpdate: (id: string, changes: TodoChanges) => void;
  onDelete: (id: string) => void;
}

export function checkboxId(id: string): string {
  return `todo-check-${id}`;
}

function hasChanges(todo: Todo, title: string, details: TodoDetails): boolean {
  return (
    title !== todo.title ||
    details.description !== todo.description ||
    details.priority !== todo.priority ||
    details.dueDate !== todo.dueDate
  );
}

export function TodoItem({ todo, highlighted, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [detailsDraft, setDetailsDraft] = useState<TodoDetails>(() => getDetails(todo));
  const editingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);
  const titleId = `todo-title-${todo.id}`;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      editButtonRef.current?.focus();
    }
  }, [isEditing]);

  function startEditing() {
    editingRef.current = true;
    setDraft(todo.title);
    setDetailsDraft(getDetails(todo));
    setIsEditing(true);
  }

  /** Leaves edit mode; only an explicit save (Enter or «Сохранить») changes the task. */
  function finishEditing(save: boolean) {
    // Guards against a second call within the same render, e.g. a repeated Enter or double click.
    if (!editingRef.current) return;
    editingRef.current = false;
    restoreFocusRef.current = true;
    setIsEditing(false);
    if (!save) return;

    const title = normalizeTitle(draft);
    const details = normalizeDetails(detailsDraft);
    if (isValidTitle(title) && details && hasChanges(todo, title, details)) {
      onUpdate(todo.id, { title, ...details });
    }
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      finishEditing(true);
    }
  }

  /** Escape cancels from any field of the editor, including the description. */
  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      finishEditing(false);
    }
  }

  return (
    <li
      className="todo"
      data-completed={todo.completed}
      data-editing={isEditing}
      data-highlighted={highlighted}
    >
      <span className="todo__check">
        <input
          id={checkboxId(todo.id)}
          className="todo__checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          aria-labelledby={titleId}
          disabled={isEditing}
        />
        <span className="todo__box" aria-hidden="true">
          <Check {...iconProps} />
        </span>
      </span>

      {isEditing ? (
        <div className="todo__editor" onKeyDown={handleEditorKeyDown}>
          <input
            ref={inputRef}
            className="todo__edit"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleTitleKeyDown}
            maxLength={MAX_TITLE_LENGTH}
            enterKeyHint="done"
            aria-label="Текст задачи"
          />
          <TodoDetailsFields id={`todo-${todo.id}`} value={detailsDraft} onChange={setDetailsDraft} />
          <div className="todo__edit-actions">
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => finishEditing(false)}
            >
              Отмена
            </button>
            <button
              type="button"
              className="button button--secondary button--small"
              onClick={() => finishEditing(true)}
            >
              Сохранить
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="todo__body">
            <span id={titleId} className="todo__title" onDoubleClick={startEditing}>
              {todo.title}
            </span>
            {todo.description && <p className="todo__description">{todo.description}</p>}
            <TodoMeta todo={todo} />
          </div>
          <div className="todo__actions">
            <button
              ref={editButtonRef}
              type="button"
              className="icon-button"
              onClick={startEditing}
              aria-label={`Изменить задачу «${todo.title}»`}
              title="Изменить"
            >
              <Pencil {...iconProps} />
            </button>
            <button
              type="button"
              className="icon-button icon-button--danger"
              onClick={() => onDelete(todo.id)}
              aria-label={`Удалить задачу «${todo.title}»`}
              title="Удалить"
            >
              <Trash2 {...iconProps} />
            </button>
          </div>
        </>
      )}
    </li>
  );
}
