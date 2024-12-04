import { useMemo, useState, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';

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
        valueGetter: 'node.rowIndex + 1',
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
              if (valueA === null || valueA === undefined) return 1;
              if (valueB === null || valueB === undefined) return -1;
              if (valueA < valueB) return -1;
              if (valueA > valueB) return 1;
              return 0;
            }
          });
        }
      }
    });

    setColDefs(columns);

    // Підготовка рядків
    const rows: RowData[] = []; // Використовуємо RowData для кожного рядка

    for (let i = 0; i < maxLength; i++) {
      const row: RowData = {};

      data.forEach((obj) => {
        for (const key in obj) {
          const value = obj[key];
          // Якщо є масив, додаємо значення за індексом i, або null, якщо індекс вийшов за межі масиву
          row[key] = Array.isArray(value) ? (value[i] !== undefined ? value[i] : null) : (value !== undefined ? value : null);
        }
      });

      rows.push(row);
    }

    setRowData(rows);
  }

  // Викликаємо prepareData, коли дані змінюються
  useEffect(() => {
    if (data && data.length > 0) {
      prepareData(data);
    }
  }, [data]);

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
