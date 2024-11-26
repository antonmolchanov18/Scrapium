import { useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; 
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community'; 

interface RowData {
  make: string;
  model: string;
  price: number;
  electric: boolean;
}

export const DataPreview = () => {
  const gridApi = useRef<any>(null);
  const defaultColDef = useMemo(() => ({
    minWidth: 100,
    flex: 1,         // Ensures columns are resizable and take available space equally
    sortable: true,  // Default to sortable columns
    filter: true,    // Default to filterable columns
  }), []);

  const [rowData, setRowData] = useState<RowData[]>([ 
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
  ]);

  const [colDefs, setColDefs] = useState([
    { 
      headerName: 'No.', 
      valueGetter: 'node.rowIndex + 1', // Виводить порядковий номер
      maxWidth: 100,
    },
    { field: 'make', headerName: 'Make', sortable: true, filter: true, floatingFilter: true },
    { field: 'model', headerName: 'Model', sortable: true, filter: true, floatingFilter: true },
    { field: 'price', headerName: 'Price', sortable: true, filter: true, floatingFilter: true },
    { field: 'electric', headerName: 'Electric', sortable: true, filter: true, floatingFilter: true },
    { field: 'make', headerName: 'Make', sortable: true, filter: true, floatingFilter: true },
    { field: 'model', headerName: 'Model', sortable: true, filter: true, floatingFilter: true },
  ] as (ColDef<RowData>)[]);

  const onExport = () => {
    gridApi.current.api.exportDataAsCsv();
  };

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
