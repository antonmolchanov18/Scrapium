import { Routes, Route, useLocation  } from 'react-router-dom';

import './styles/main.scss';

import { Layout } from './components/Layout/Layout';
import { Home } from './components/Home/Home';
import { AddTask } from './components/AddTask/AddTask';
import { TaskList } from './components/TaskList/TaskList';
import { Settings } from './components/Settings/Settigs';
import { Authorization } from './components/Authorization/Authorization';
import { ParsingWorkspace } from './components/ParsingWorkspace/ParsingWorkspace';
import DataAnalysisPage from './components/DataAnalysisWorkspace/DataAnalysesPage';

function App() {
  const location = useLocation();
  const isAuthorizationOpen = location.pathname === '/authorization';
  return (
    <>
       <Routes location={isAuthorizationOpen ? '/' : location}>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='add-task' element={<AddTask />} />
          <Route path='task-list' element={<TaskList />} />
          <Route path='settings' element={<Settings />} />
          <Route path='parsing-workspace' element={<ParsingWorkspace />} />
          <Route path="analyse-workspace" element={<DataAnalysisPage />} />
        </Route>
      </Routes>
      {isAuthorizationOpen && <Authorization />}
    </>
  )
}

export default App
