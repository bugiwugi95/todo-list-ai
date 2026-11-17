import type { TodoDetails } from '../types';
import { MAX_DESCRIPTION_LENGTH, PRIORITIES, PRIORITY_LABELS, isPriority } from '../lib/todos';

interface TodoDetailsFieldsProps {
  /** Unique prefix for element ids, so labels stay linked when several editors exist. */
  id: string;
  value: TodoDetails;
  onChange: (value: TodoDetails) => void;
}

/** Description, priority and due date inputs, shared by the add form and the inline editor. */
export function TodoDetailsFields({ id, value, onChange }: TodoDetailsFieldsProps) {
  function set<K extends keyof TodoDetails>(key: K, fieldValue: TodoDetails[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="details">
      <div className="field">
        <label htmlFor={`${id}-description`} className="field__label">
          Описание
        </label>
        <textarea
          id={`${id}-description`}
          className="field__control field__control--textarea"
          value={value.description}
          onChange={(event) => set('description', event.target.value)}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={3}
          placeholder="Необязательно"
        />
      </div>

      <div className="details__row">
        <div className="field">
          <label htmlFor={`${id}-priority`} className="field__label">
            Приоритет
          </label>
          <select
            id={`${id}-priority`}
            className="field__control"
            value={value.priority}
            onChange={(event) => {
              if (isPriority(event.target.value)) set('priority', event.target.value);
            }}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor={`${id}-due`} className="field__label">
            Срок
          </label>
          <div className="field__inline">
            <input
              id={`${id}-due`}
              className="field__control"
              type="date"
              value={value.dueDate ?? ''}
              onChange={(event) => set('dueDate', event.target.value || null)}
            />
            {value.dueDate !== null && (
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={() => set('dueDate', null)}
              >
                Убрать
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
