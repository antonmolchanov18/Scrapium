import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DataPreview } from '../DataPreview/DataPreview';
import axiosInstance from '../../api/axiosInstance';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const DataAnalysisPage = () => {
  const location = useLocation();
  const keyTask = location.state?.key;

  const [rawData, setRawData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!keyTask) return;
      setIsReady(false);
      const parserData = await window.API.getParserData(keyTask);
      setRawData(parserData);
      setDisplayData(parserData);
      setColumnNames(Object.keys(parserData[0] || {}));
      setIsReady(true);
    };
    fetchData();
  }, [keyTask]);

  const classifyColumns = async () => {
    try {
      setDisplayData([]);
      setIsReady(false);
      const response = await axiosInstance.post('/classify-columns', {
        data: rawData,
      });

      const { columns, data } = response.data;
      setColumnNames(columns);
      setDisplayData(data);
      setIsReady(true);
    } catch (error) {
      console.error('Помилка при класифікації колонок:', error);
      setIsReady(true);
    }
  };

  const graphData = useMemo(() => {
    if (!displayData || displayData.length === 0) return [];

    const record = displayData[0];
    const columnKeys = Object.keys(record);

    const numberCol = columnKeys.find(key =>
      record[key].some((val: any) =>
        !isNaN(parseFloat(String(val).replace(/\s/g, '').replace(',', '.')))
      )
    );

    const labelCol = columnKeys.find(key =>
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

  return (
    <div className="analysis-workspace" style={{ padding: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10
      }}>
        <h1>Аналіз даних</h1>
        <p style={{ fontStyle: 'italic' }}>Задача: <strong>{keyTask}</strong></p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button onClick={classifyColumns}>
          🧐 Автокласифікація колонок
        </button>
      </div>

      {isReady && graphData.length > 0 && (
        <>
          <h3>Візуалізація</h3>
          <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
            <BarChart width={500} height={300} data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(graphData[0])[0]} />
              <YAxis />
              <ReTooltip />
              <Legend />
              <Bar dataKey={Object.keys(graphData[0])[1]} fill="#8884d8" />
            </BarChart>

            <PieChart width={400} height={300}>
              <Pie
                data={graphData}
                dataKey={Object.keys(graphData[0])[1]}
                nameKey={Object.keys(graphData[0])[0]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {graphData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 36}, 70%, 50%)`} />
                ))}
              </Pie>
              <ReTooltip />
            </PieChart>
          </div>
        </>
      )}

      <h3 style={{ marginTop: 40 }}>Попередній перегляд таблиці</h3>
      <div style={{ height: '500px' }}>
        {isReady && displayData.length > 0 ? (
          <DataPreview
            key={keyTask}
            data={displayData}
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
