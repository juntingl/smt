import { a, useTransition } from '@react-spring/web'
import TodoItem from './TodoItem';
import { useStore } from '../store/todos';

const Filtered = () => {
  const { todos, filter } = useStore();

  const filterTodo = todos.filter(todo => {
    if (filter === "all") return true;
    if (filter === "completed") return todo.completed;
    return !todo.completed;
  });
  const transitions = useTransition(filterTodo, {
    keys: todo => todo.id,
    from: { opacity: 0, height: 0 },
    enter: { opacity: 1, height: 40 },
    leave: { opacity: 0, height: 0 }
  });

  return transitions((style, item) => (
    <a.div className="item" style={style}>
      <TodoItem item={item} />
    </a.div>
  ));
}

export default Filtered;