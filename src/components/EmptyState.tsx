import type { Filter } from '../types';

interface EmptyStateProps {
  filter: Filter;
  hasTodos: boolean;
}

function getMessage(filter: Filter, hasTodos: boolean): { title: string; hint: string } {
  if (!hasTodos) {
    return {
      title: 'Здесь пока пусто',
      hint: 'Запишите первую задачу в поле выше. Список сохраняется в этом браузере.',
    };
  }
  if (filter === 'active') {
    return {
      title: 'Активных задач нет',
      hint: 'Всё выполнено. Новую задачу можно добавить в поле выше.',
    };
  }
  return {
    title: 'Выполненных задач пока нет',
    hint: 'Отметьте задачу, и она появится в этом списке.',
  };
}

export function EmptyState({ filter, hasTodos }: EmptyStateProps) {
  const { title, hint } = getMessage(filter, hasTodos);
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__hint">{hint}</p>
    </div>
  );
}
