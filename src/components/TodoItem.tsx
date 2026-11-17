import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import type { Todo } from '../types';
import { MAX_TITLE_LENGTH, normalizeTitle } from '../lib/todos';
import { iconProps } from '../icons';

interface TodoItemProps {
  todo: Todo;
  highlighted: boolean;
  onToggle: (todo: Todo) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function checkboxId(id: string): string {
  return `todo-check-${id}`;
}

export function TodoItem({ todo, highlighted, onToggle, onRename, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
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
    setIsEditing(true);
  }

  function finishEditing(save: boolean, restoreFocus: boolean) {
    // Guards against a second call, e.g. blur right after Enter.
    if (!editingRef.current) return;
    editingRef.current = false;
    restoreFocusRef.current = restoreFocus;
    setIsEditing(false);

    const title = normalizeTitle(draft);
    if (save && title && title !== todo.title) {
      onRename(todo.id, title);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      finishEditing(true, true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      finishEditing(false, true);
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
        <>
          <input
            ref={inputRef}
            className="todo__edit"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => finishEditing(true, false)}
            maxLength={MAX_TITLE_LENGTH}
            enterKeyHint="done"
            aria-label="Текст задачи"
          />
          <div className="todo__edit-actions">
            {/* preventDefault on mousedown keeps focus in the input, so blur does not save first. */}
            <button
              type="button"
              className="button button--ghost button--small"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => finishEditing(false, true)}
            >
              Отмена
            </button>
            <button
              type="button"
              className="button button--secondary button--small"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => finishEditing(true, true)}
            >
              Сохранить
            </button>
          </div>
        </>
      ) : (
        <>
          <span id={titleId} className="todo__title" onDoubleClick={startEditing}>
            {todo.title}
          </span>
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
