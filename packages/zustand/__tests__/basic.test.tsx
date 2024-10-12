import { act, fireEvent, render } from '@testing-library/react'
import { create } from '../src'
import React from 'react'

type FilterType = 'all' | 'completed' | 'incompleted'

type Todo = {
  id: number
  title: string
  completed: boolean
}

type State = {
  todos: Todo[]
  filter: FilterType
}

type Actions = {
  setFilter: (filter: FilterType) => void
  setTodos: (fn: (todos: Array<Todo>) => Array<Todo>) => void
  reset: () => void
}

const INITIAL_STATE: State = {
  filter: 'all',
  todos: [],
}

const useStore = create<State & Actions>((set) => ({
  ...INITIAL_STATE,
  setFilter(filter: FilterType) {
    set({ filter })
  },
  setTodos(fn: (todos: Array<Todo>) => Array<Todo>) {
    set((prev) => ({ todos: fn(prev.todos) }))
  },
  reset() {
    set(INITIAL_STATE)
  },
}))

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  ;(console.warn as jest.Mock).mockRestore()
  useStore.getState().reset()
})

describe('Zustand 核心功能测试', () => {
  it('组件正确拿到 Store 的状态', async () => {
    const App = () => {
      const { filter } = useStore()
      return <div>filter: {filter}</div>
    }
    const { findByText } = render(<App />)
    await findByText('filter: all')
  })

  it('不加selector 功能正常', async () => {
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

  it('正确通知组件完成 re-render', async () => {
    const App = () => {
      const { filter, setFilter } = useStore()
      return (
        <>
          <div>filter: {filter}</div>
          <button onClick={() => setFilter('completed')}>dispatch</button>
        </>
      )
    }
    const { getByText, findByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    findByText('filter: complete')
  })
})
