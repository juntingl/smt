import { FormEvent } from 'react';
import './App.css';
import Filter from './components/Filter';
import Filtered from './components/Filtered';
import { useStore } from './store/todos';
import Fetch from './pages/fetch';

let keyCount = 0;

function App() {
  const { setTodos } = useStore()

  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = e.currentTarget.inputTitle.value;
    e.currentTarget.inputTitle.value = "";

    setTodos((prevTodos) => [...prevTodos, { title, completed: false, id: keyCount++ }]);
  }

  return (
    <>
      <form onSubmit={add} className='basic-50'>
        <Filter />
        <input type="text" name="inputTitle" placeholder='please input todo......' />
        <Filtered />
      </form>
      {/* <Fetch /> */}
    </>
  )
}

export default App
