import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

type GetState<T> = () => T

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
) => void

type Subscribe = Parameters<typeof useSyncExternalStoreWithSelector>[0]

export type StoreApi<T> = {
  getState: GetState<T>
  setState: SetState<T>
  subscribe: Subscribe
}

type StateCreator<T> = (setState: SetState<T>) => T

type EqualityFn<T> = (a: T, b: T) => boolean

const createStore = <T>(createState: StateCreator<T>): StoreApi<T> => {
  const listeners = new Set<() => void>()
  // type TState = ReturnType<typeof createState>
  let state: T // store 内部状态存储于 state 上
  const getState = () => state
  // setState 就是 create 接收函数的入参
  const setState: SetState<T> = (partial) => {
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: T) => T)(state)
        : partial

    if (!Object.is(nextState, state)) {
      state =
        typeof nextState !== 'object' || nextState === null
          ? (nextState as T)
          : Object.assign({}, state, nextState)
      listeners.forEach((listener) => listener())
    }
  }
  // 每次订阅时将 subscribe 加入到 listeners, subscribe 的作用是触发组件重新渲染
  const subscribe: Subscribe = (subscribe) => {
    listeners.add(subscribe)
    return () => listeners.delete(subscribe)
  }
  const api = { getState, setState, subscribe }
  state = createState(setState) // state 的初始值就是调用 createState 的调用结果
  return api
}

const useStore = <State, StateSlice>(
  api: StoreApi<State>,
  selector: (state: State) => StateSlice = api.getState as any,
  equalityFn?: EqualityFn<StateSlice>,
) => {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState, // 获取客户端状态
    api.getState, // 获取服务端状态
    selector,
    equalityFn, // 判断状态前后是否一致函数
  )
  return slice
}

export const create = <T>(createState: StateCreator<T>) => {
  const api = createStore(createState) // 拿到 store，包含了所有操作 store 的方法
  const useBoundStore = <TSlice = T>(
    selector?: (state: T) => TSlice,
    equalityFn?: EqualityFn<TSlice>,
  ) => useStore(api, selector, equalityFn)
  Object.assign(useBoundStore, api)
  return useBoundStore as typeof useBoundStore & StoreApi<T>
}
