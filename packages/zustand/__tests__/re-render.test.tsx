import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'
import { create, StoreApi, UseBoundStore } from 'zustand'
import { shallow } from 'zustand/shallow'
import { useShallow } from 'zustand/react/shallow'

type FilterType = 'all' | 'completed' | 'incompleted'

export type Todo = {
  id: number
  title: string
  completed: boolean
}

export type Store = {
  todos: Array<Todo>
  filter: FilterType
  setFilter: (filter: FilterType) => void
  setTodos: (fn: (todos: Array<Todo>) => Array<Todo>) => void
}

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

describe('测试 re-render', () => {
  it('不加 selector', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [],
      setFilter(filter: FilterType) {
        set({ filter })
      },
      setTodos(fn: (todos: Array<Todo>) => Array<Todo>) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++
      // const todos = useStore((state) => state.todos)
      // 不加 selector 的情况下，会导致额外的一次 re-render
      const { todos } = useStore()
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )

    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    // 一次点击，却渲染了2次
    expect(renderCount).toBe(2)
  })

  it('加 selector', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [],
      setFilter(filter: FilterType) {
        set({ filter })
      },
      setTodos(fn: (todos: Array<Todo>) => Array<Todo>) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++
      const todos = useStore((state) => state.todos)
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )

    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    // 一次点击，却渲染了2次
    expect(renderCount).toBe(1)
  })

  it('通过 zustand 创建一个自动加 selector 的函数', async () => {
    const useStoreBase = create<Store>((set) => ({
      filter: 'all',
      todos: [],
      setFilter(filter: FilterType) {
        set({ filter })
      },
      setTodos(fn: (todos: Array<Todo>) => Array<Todo>) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))
    const useStore = createSelectors(useStoreBase)

    let renderCount = 0

    const Display = () => {
      renderCount++
      const todos = useStore.use.todos()

      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const setFilter = useStore.use.setFilter()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )

    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    // 一次点击，却渲染了2次
    expect(renderCount).toBe(1)
  })

  it('不加 selector, 进行浅比较 shallow', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [],
      setFilter(filter: FilterType) {
        set({ filter })
      },
      setTodos(fn: (todos: Array<Todo>) => Array<Todo>) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++
      const { todos } = useStore(
        (state) => ({
          todos: state.todos,
          setFilter: state.setFilter,
        }),
        shallow,
      )
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )

    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    // 一次点击，却渲染了2次
    expect(renderCount).toBe(1)
  })

  it('useShallow,使用 Zustand 提供的 hook', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [],
      setFilter(filter: FilterType) {
        set({ filter })
      },
      setTodos(fn: (todos: Array<Todo>) => Array<Todo>) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++
      // const todos = useStore((state) => state.todos)
      // 不加 selector 的情况下，会导致额外的一次 re-render
      const { todos } = useStore(
        useShallow((state) => ({
          todos: state.todos,
          setFilter: state.setFilter,
        })),
      )
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )

    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    // 一次点击，却渲染了2次
    expect(renderCount).toBe(1)
  })
})
