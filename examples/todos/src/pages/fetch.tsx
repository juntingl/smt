import { useEffect } from 'react'
import { create } from 'zustand'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}
type Store = {
  todos: Todo[] | null
  error: Error | null
  fetchData: () => void
}

const useStore = create<Store>((set) => ({
  todos: null,
  error: null,
  fetchData: async () => {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos')
      const todos = await res.json()
      set({ todos })
    } catch (error) {
      if (error instanceof Error) {
        set({ error })
      } else {
        set({ error: new Error('Unknown error occurred') })
      }
    }
  },
}))

export default function asyncWithZustand() {
  const { todos, fetchData, error } = useStore()

  useEffect(() => {
    fetchData()
  }, [])

  if (!todos) return <div>Loading......</div>

  if (error) return <div>{error.message}</div>

  return (
    <div className="">
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  )
}
