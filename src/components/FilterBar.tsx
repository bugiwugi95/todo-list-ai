import type { Filter } from '../types';

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
];

interface FilterBarProps {
  value: Filter;
  counts: Record<Filter, number>;
  onChange: (filter: Filter) => void;
}

export function FilterBar({ value, counts, onChange }: FilterBarProps) {
  return (
    <div className="filters" role="group" aria-label="Показать задачи">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className="filters__button"
          aria-pressed={value === filter.value}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
          <span className="filters__count" aria-label={`: ${counts[filter.value]}`}>
            {counts[filter.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
