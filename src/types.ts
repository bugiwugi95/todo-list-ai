export type Priority = 'low' | 'medium' | 'high';

/** Optional task details, edited together in the add form and in the inline editor. */
export interface TodoDetails {
  description: string;
  priority: Priority;
  /** Calendar day "YYYY-MM-DD" without time or time zone, or null when not set. */
  dueDate: string | null;
}

export interface Todo extends TodoDetails {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export type Filter = 'all' | 'active' | 'completed';
