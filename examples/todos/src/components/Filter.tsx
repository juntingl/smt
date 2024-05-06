import { Radio } from 'antd';
import { useStore } from '../store/todos';

const Filter = () => {
  const { filter, setFilter } = useStore();

  return (
    <Radio.Group
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <Radio value="all">All</Radio>
      <Radio value="completed">Completed</Radio>
      <Radio value="incompleted">Incompleted</Radio>
    </Radio.Group>
  );
}

export default Filter;