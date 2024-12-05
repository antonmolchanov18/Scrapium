import { useMemo, useState, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import { addTab } from '../../store/tabSlice';
import { useDispatch } from 'react-redux';


import IconDelete from '../../assets/icons/delete-icon.svg?react';
import IconOpen from '../../assets/icons/open-icon.svg?react';

interface RowData {
  [key: string]: any;
}

export const TaskList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gridApi = useRef<any>(null);

  const defaultColDef = useMemo(
    () => ({
      minWidth: 100,
      flex: 1,
      sortable: true,
      filter: true,
    }),
    []
  );

  const handleDelete = async (id: number, keyTask: string) => {
    setRowData((prevData) => prevData.filter((row) => row.id !== id));
    await window.API.deleteTask(keyTask);
  };

  const handleOpenTask = async (keyTask: string) => { // Отримання ключа завдання
    
    const fetchedTab = await window.API.getTask(keyTask);

    const task = {
      key: keyTask,
      data: fetchedTab,
    };
  
    const newTab = {
      task, 
      isActive: true,
      input: '',
      isSwitchOn: false,
    };
    
    dispatch(addTab(newTab));
    navigate('/parsing-workspace', { state: { key: keyTask } }); // Передача ключа через state
  };

  const [rowData, setRowData] = useState<RowData[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<RowData>[]>([
    { field: 'id', headerName: 'ID', maxWidth: 100,},
    { field: 'taskName', headerName: 'Task Name', },
    {
      field: 'status',
      headerName: 'Status',
      cellClassRules: {
        'ready-status': (params) => params.value === 'Ready',
        'running-status': (params) => params.value === 'Running',
        'error-status': (params) => params.value === 'Error',
        'completed-status': (params) => params.value === 'Completed',
      },
    },
    { field: 'createdDate', headerName: 'Created Date',},
    { field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filter: false,
      maxWidth: 100,
      headerClass: 'text-center',
      cellStyle: { textAlign: 'center',},
      cellRenderer: (params: any) => (
        <>
          <IconOpen className='icon icon-small' onClick={() => handleOpenTask(params.data.keyTask)} />
          <IconDelete className='icon icon-small' onClick={() => handleDelete(params.data.id, params.data.keyTask)} />
        </>
      ),
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allTask = await window.API.getAllTask();
        console.log('All tasks:', allTask);
        
        // Assuming `allTask` is an array of objects with a structure like `{ key: "00000000", value: { title, url, createdDate, status } }`
        const rows = allTask.map((obj: any, index: number) => {
          console.log(obj.key);
          
          return  {
          id: index + 1, // Add index as ID or use a unique identifier from the API
          taskName: obj.value?.title, // Accessing the title inside the value object
          status: obj.value?.status, // Accessing the status inside the value object
          createdDate: obj.value?.createdDate, // Accessing the createdDate inside the value object
          keyTask: obj.key,
          actions: 'del', // Set default action if needed
        }});

        setRowData(rows); // Set rowData for the grid
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="ag-theme-quartz table" style={{ height: '100%' }}>
      <AgGridReact
        ref={gridApi}
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
      />
    </div>
  );
};
