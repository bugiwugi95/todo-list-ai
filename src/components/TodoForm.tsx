import { forwardRef, useState, type FormEvent } from 'react';
import type { TodoDetails } from '../types';
import {
  DEFAULT_DETAILS,
  MAX_TITLE_LENGTH,
  isValidTitle,
  normalizeDetails,
  normalizeTitle,
} from '../lib/todos';
import { TodoDetailsFields } from './TodoDetailsFields';

interface TodoFormProps {
  onAdd: (title: string, details: TodoDetails) => void;
}

export const TodoForm = forwardRef<HTMLInputElement, TodoFormProps>(function TodoForm(
  { onAdd },
  inputRef,
) {
  const [value, setValue] = useState('');
  const [showError, setShowError] = useState(false);
  const [details, setDetails] = useState<TodoDetails>(DEFAULT_DETAILS);
  const [showDetails, setShowDetails] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = normalizeTitle(value);
    if (!isValidTitle(title)) {
      setShowError(true);
      setValue('');
      return;
    }
    const normalizedDetails = normalizeDetails(details);
    if (!normalizedDetails) return;
    onAdd(title, normalizedDetails);
    setValue('');
    setDetails(DEFAULT_DETAILS);
    setShowDetails(false);
  }

  return (
    <form className="composer" onSubmit={handleSubmit} noValidate>
      <div className="composer__row">
        <label htmlFor="new-todo" className="visually-hidden">
          Новая задача
        </label>
        <input
          ref={inputRef}
          id="new-todo"
          className="composer__input"
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (showError) setShowError(false);
          }}
          placeholder="Добавить задачу"
          maxLength={MAX_TITLE_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={showError}
          aria-describedby={showError ? 'new-todo-error' : undefined}
          autoFocus
        />
        <button type="submit" className="button button--primary composer__submit">
          Добавить
        </button>
      </div>
      {showError && (
        <p id="new-todo-error" className="composer__error" role="alert">
          Введите текст задачи
        </p>
      )}

      <button
        type="button"
        className="button button--ghost button--small composer__more"
        aria-expanded={showDetails}
        aria-controls="new-todo-details"
        onClick={() => setShowDetails((open) => !open)}
      >
        {showDetails ? 'Скрыть подробности' : 'Подробнее'}
      </button>
      {showDetails && (
        <div id="new-todo-details" className="composer__details">
          <TodoDetailsFields id="new-todo" value={details} onChange={setDetails} />
        </div>
      )}
    </form>
  );
});
