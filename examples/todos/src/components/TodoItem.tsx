import { CloseOutlined } from '@ant-design/icons';
import type { Todo } from '../store/todos';
import { useStore } from '../store/todos';

const TodoItem = ({ item } : { item: Todo }) => {
  const { setTodos } = useStore();
  const { title, completed, id } = item;

  const toggleCompleted = () => setTodos((prevTodos) => prevTodos.map(prevItem => prevItem.id === id ? { ...prevItem, completed: !completed } : prevItem))

  const remove = () => {
    setTodos(prevTodos => prevTodos.filter(prevItem => prevItem.id !== id))
  }

  return (
    <>
      <input type="checkbox" checked={completed} onChange={toggleCompleted} />
      <span style={{ textDecoration: completed ? "line-through" : "" }}>
        {title}
      </span>
      <CloseOutlined onClick={remove} />
    </>
  );
}

export default TodoItem;