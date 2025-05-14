import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DataPreview } from '../DataPreview/DataPreview';
import axiosInstance from '../../api/axiosInstance';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

function normalizeToDataPreviewFormat(data: any[]): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  data.forEach((item, i) => {
    for (const key in item) {
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item[key]);
    }
  });
  return [result]; // обгортаємо в масив, бо DataPreview очікує масив об'єктів
}

const DataAnalysisPage = () => {
  const location = useLocation();
  const keyTask = location.state?.key;

  const [rawData, setRawData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [showCharts, setShowCharts] = useState(false); // Додаємо стан для кнопки графіків
  const [chartType, setChartType] = useState("bar");
  const [xColumn, setXColumn] = useState<string>("");
  const [yColumn, setYColumn] = useState<string>("count");
  const [tableData, setTableData] = useState<any[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // <– нове!

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      window.location.href = "/login";
    }

    setAuthChecked(true); // показує, що перевірка завершена
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      if (!keyTask) return;
      setIsReady(false);
      setShowCharts(false); // Скидаємо показ графіків при новому завантаженні
      const parserData = await window.API.getParserData(keyTask);
      setRawData(parserData);
      setDisplayData(parserData);
      setTableData(parserData);
      setColumnNames(Object.keys(parserData[0] || {}));
      setIsReady(true);
    };
    fetchData();
  }, [keyTask]);

  const handleUploadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          const cols = Object.keys(parsed[0] || {});
          setRawData(parsed);
          setDisplayData([]);
          setDisplayData(parsed);
          setTableData(normalizeToDataPreviewFormat(parsed));
          setColumnNames(cols);
          setXColumn(cols[0] || "");
          setYColumn("count");
          setIsReady(true);
          setShowCharts(false);
        } else {
          alert("JSON має бути масивом об'єктів.");
        }
      } catch (err) {
        alert("Помилка при читанні JSON: " + err);
      }
    };

    reader.readAsText(file);
  };


  const classifyColumns = async () => {
    try {
      setDisplayData([]);
      setIsReady(false);
      setShowCharts(false); // Скидаємо показ графіків при новій класифікації
      const response = await axiosInstance.post('/classify-columns', {
        data: rawData,
      });

      const { columns, data } = response.data;
      setColumnNames(columns);
      setDisplayData(data);
      setTableData(data);
      setIsReady(true);
    } catch (error) {
      console.error('Помилка при класифікації колонок:', error);
      setIsReady(true);
    }
  };
  const chartData = useMemo(() => {
    if (!xColumn || !displayData.length) return [];

    const map = new Map<string, number>();

    displayData.forEach(row => {
      const xValue = row[xColumn];
      const yValue = yColumn === "count"
        ? 1
        : Number(row[yColumn]);

      if (!map.has(xValue)) {
        map.set(xValue, yValue);
      } else {
        map.set(xValue, map.get(xValue)! + yValue);
      }
    });

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [displayData, xColumn, yColumn]);

  const graphData = useMemo(() => {
    if (!displayData || displayData.length === 0) return [];

    const record = displayData[0];
    const columnKeys = Object.keys(record);

   const numberCol = columnKeys.find(key =>
     Array.isArray(record[key]) &&
     record[key].some((val: any) =>
       !isNaN(parseFloat(String(val).replace(/\s/g, '').replace(',', '.')))
     )
   );

   const labelCol = columnKeys.find(key =>
     Array.isArray(record[key]) &&
     record[key].some((val: any) =>
       typeof val === 'string' && isNaN(parseFloat(val))
     )
   );


    if (!numberCol || !labelCol) return [];

    return record[labelCol].map((label: string, i: number) => ({
      [labelCol]: label,
      [numberCol]: parseFloat(String(record[numberCol][i]).replace(/\s/g, '').replace(',', '.')) || 0
    }))
    .filter(item => item[labelCol] && !isNaN(item[numberCol]))
    .slice(0, 10);
  }, [displayData]);
  if (!authChecked) {
    return <p style={{ padding: 20 }}>🔐 Перевірка авторизації...</p>;
  }

  if (!authorized) {
    return <p style={{ padding: 20 }}>⛔ Доступ заборонено.</p>;
  }

  return (

    <div className="analysis-workspace" style={{ padding: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10
      }}>
        <h1>Аналіз даних</h1>
        <p style={{ fontStyle: 'italic' }}>Задача: <strong>{keyTask}</strong></p>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button onClick={classifyColumns}>🧐 Автокласифікація колонок</button>
        <button onClick={() => setShowCharts(true)}>📊 Побудувати графіки</button>
        <label htmlFor="upload-json" style={{ cursor: 'pointer', background: '#eee', padding: '5px 10px', borderRadius: '5px' }}>
          📁 Завантажити JSON
        </label>
        <input
          id="upload-json"
          type="file"
          accept=".json"
          onChange={handleUploadJson}
          style={{ display: 'none' }}
        />
      </div>

    <select onChange={(e) => setChartType(e.target.value)}>
      <option value="bar">Bar Chart</option>
      <option value="pie">Pie Chart</option>
    </select>

    <select onChange={(e) => setXColumn(e.target.value)}>
      {columnNames.map(name => <option key={name}>{name}</option>)}
    </select>

    <select onChange={(e) => setYColumn(e.target.value)}>
      <option value="count">Count (кількість)</option>
      {columnNames.map(name => <option key={name}>{name}</option>)}
    </select>

      {isReady && showCharts && chartData.length > 0 && (
        <div>
          <h3>Візуалізація</h3>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
              {chartType === "bar" && (
                <BarChart width={1000} height={400} data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              )}

              {chartType === "pie" && (
                <PieChart width={400} height={300}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 36}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              )}
            </div>
          </div>
        </div>
      )}

      <h3 style={{ marginTop: 0 }}>Попередній перегляд таблиці</h3>
      <div style={{ height: '1000px' }}>
        {isReady && displayData.length > 0 ? (
          <DataPreview
            key={keyTask ?? 'local-json-' + displayData.length}
            data={tableData}
            columns={columnNames}
          />
        ) : (
          <p>Завантаження даних або немає що показати...</p>
        )}
      </div>
    </div>
  );
};

export default DataAnalysisPage;
