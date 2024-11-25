import { Routes, Route } from 'react-router-dom';

import './styles/main.scss';

import { Layout } from './components/Layout/Layout';
import { Home } from './components/Home/Home';
import { AddTask } from './components/AddTask/AddTask';
import { TaskList } from './components/TaskList/TaskList';
import { Settings } from './components/Settings/Settigs';
import { SignIn } from './components/SignIn/SignIn';
import { ParsingWorkspace } from './components/ParsingWorkspace/ParsingWorkspace';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='add-task' element={<AddTask />} />
          <Route path='task-list' element={<TaskList />} />
          <Route path='sign-in' element={<SignIn />} />
          <Route path='settings' element={<Settings />} />
          <Route path='parsing-workspace' element={<ParsingWorkspace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
