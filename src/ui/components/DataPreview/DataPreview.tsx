import { useMemo, useState, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';

import SaveIcon from '../../assets/icons/save-icon.svg?react';

interface RowData {
  [key: string]: any;
}

export const DataPreview = ({ data }: { data: Array<{ [key: string]: any }> }) => {
  const gridApi = useRef<any>(null);
  const defaultColDef = useMemo(() => ({
    minWidth: 100,
    flex: 1,
    sortable: true,
    filter: true,
  }), []);
  
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<RowData>[]>([]);

  function prepareData(data: Array<{ [key: string]: any }>) {

    const maxLength = data.reduce((max, item) => {
      for (const key in item) {
        if (Array.isArray(item[key])) {
          max = Math.max(max, item[key].length);
        }
      }

      return max;
    }, 0);

    if (maxLength === 0) {
      return;
    }

    const columns: ColDef<RowData>[] = [
      {
        headerName: 'No.',
        field: 'id',
        maxWidth: 100,
      }
    ];

    data.forEach((obj) => {
      for (const key in obj) {
        if (!columns.some(col => col.field === key)) {
          columns.push({
            field: key,
            headerName: key,
            sortable: true,
            filter: true,
            floatingFilter: true,
            comparator: (valueA, valueB) => {
              if (valueA === null || valueA === undefined) {
                return 1
              };

              if (valueB === null || valueB === undefined) {
                return -1
              };

              if (valueA < valueB) {
                return -1
              };

              if (valueA > valueB) {
                return 1
              };

              return 0;
            }
          });
        }
      }
    });

    setColDefs(columns);

    const rows: RowData[] = [];

    for (let i = 0; i < maxLength; i++) {
      const row: RowData = {id: i + 1};

      data.forEach((obj) => {
        for (const key in obj) {
          const value = obj[key];
          row[key] = Array.isArray(value) ? (value[i] !== undefined ? value[i] : null) : (value !== undefined ? value : null);
        }
      });

      rows.push(row);
    }

    setRowData(rows);
  }

  useEffect(() => {
    if (data && data.length > 0) {
      prepareData(data);
    }
  }, [data]);

  const exportToJSON = () => {
    if (rowData && rowData.length > 0) {
      const json = JSON.stringify(rowData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToCSV = () => {
    if (gridApi.current) {
      gridApi.current.api.exportDataAsCsv();
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px'}}>
      <div style={{ display: 'flex', gap: '10px'}}>
        <p>Зберегти у CSV:</p>
        <SaveIcon className='icon' style={{alignItems: 'flex-end'}} onClick={exportToCSV}/>
      </div>
      <div style={{ display: 'flex', gap: '10px'}}>
        <p>Зберегти у JSON:</p>
        <SaveIcon className='icon' style={{alignItems: 'flex-end'}} onClick={exportToJSON}/></div>
      </div>

      <div className="ag-theme-quartz table" style={{ height: '100%' }}>
        <AgGridReact
          ref={gridApi}
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
        />
      </div>
    </div>
  );
};
