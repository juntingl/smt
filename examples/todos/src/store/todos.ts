import { create } from 'zustand';

type FilterType = 'all' | 'completed' | 'incompleted'

export type Todo = {
  id: number
  title: string
  completed: boolean
}

export type Store = {
  todos: Array<Todo>;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  setTodos: (fn: (todos: Array<Todo>) => Array<Todo>) => void
}

export const useStore = create<Store>((set) => ({
  filter: "all",
  todos: [],
  setFilter(filter: FilterType) {
    set({ filter })
  },
  setTodos(fn: (todos: Array<Todo>) => Array<Todo>) {
    set((prev) => ({ todos: fn(prev.todos) }))
  }
}));