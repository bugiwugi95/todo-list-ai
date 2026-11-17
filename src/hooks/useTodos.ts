import { useEffect, useState } from 'react';
import type { Todo } from '../types';
import { loadTodos, saveTodos } from '../storage';

/** A removed todo together with its former position, so it can be put back exactly. */
export interface RemovedTodo {
  todo: Todo;
  index: number;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  function add(title: string): Todo {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((current) => [todo, ...current]);
    return todo;
  }

  function toggle(id: string) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  }

  function rename(id: string, title: string) {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, title } : todo)));
  }

  function remove(id: string): RemovedTodo | null {
    const index = todos.findIndex((todo) => todo.id === id);
    const todo = todos[index];
    if (!todo) return null;
    setTodos((current) => current.filter((item) => item.id !== id));
    return { todo, index };
  }

  function clearCompleted(): RemovedTodo[] {
    const removed = todos.flatMap((todo, index) => (todo.completed ? [{ todo, index }] : []));
    if (removed.length > 0) {
      setTodos((current) => current.filter((todo) => !todo.completed));
    }
    return removed;
  }

  /** Puts removed todos back at their original positions (skipping any that already exist). */
  function restore(entries: RemovedTodo[]) {
    setTodos((current) => {
      const next = [...current];
      const sorted = [...entries].sort((a, b) => a.index - b.index);
      for (const { todo, index } of sorted) {
        if (next.some((item) => item.id === todo.id)) continue;
        next.splice(Math.min(index, next.length), 0, todo);
      }
      return next;
    });
  }

  const activeCount = todos.filter((todo) => !todo.completed).length;

  return {
    todos,
    counts: {
      all: todos.length,
      active: activeCount,
      completed: todos.length - activeCount,
    },
    add,
    toggle,
    rename,
    remove,
    clearCompleted,
    restore,
  };
}
