import { forwardRef, useState, type FormEvent } from 'react';
import { MAX_TITLE_LENGTH, normalizeTitle } from '../lib/todos';

interface TodoFormProps {
  onAdd: (title: string) => void;
}

export const TodoForm = forwardRef<HTMLInputElement, TodoFormProps>(function TodoForm(
  { onAdd },
  inputRef,
) {
  const [value, setValue] = useState('');
  const [showError, setShowError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = normalizeTitle(value);
    if (!title) {
      setShowError(true);
      setValue('');
      return;
    }
    onAdd(title);
    setValue('');
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
    </form>
  );
});
