import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DataPreview } from '../DataPreview/DataPreview';
import axiosInstance from '../../api/axiosInstance';

const FIELD_NAME_MAP: Record<string, string> = {
  field_1: 'Назва',
  field_2: 'Ціна',
  field_3: 'Місто',
  field_4: 'Рейтинг',
};

const DataAnalysisPage = () => {
  const location = useLocation();
  const keyTask = location.state?.key;

  const [rawData, setRawData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [renamed, setRenamed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // --- 1. Завантаження початкових даних ---
  useEffect(() => {
    const fetchData = async () => {
      if (!keyTask) return;
      setIsReady(false);
      const parserData = await window.API.getParserData(keyTask);
      setRawData(parserData);
      setDisplayData(parserData);
      setColumnNames(Object.keys(parserData[0] || {}));
      setRenamed(false);
      setIsReady(true);
    };
    fetchData();
  }, [keyTask]);

  // --- 2. Ручне перейменування колонок ---
  const renameColumns = () => {
    const renamedData = rawData.map((obj) => {
      const newObj: Record<string, any> = {};
      for (const key in obj) {
        const newKey = FIELD_NAME_MAP[key] || key;
        newObj[newKey] = obj[key];
      }
      return newObj;
    });
    setDisplayData(renamedData);
    setColumnNames(Object.values(FIELD_NAME_MAP));
    setRenamed(true);
  };

  // --- 3. Автоматична класифікація ---
  const classifyColumns = async () => {
    try {
      setDisplayData([]);  // очистити таблицю
      setIsReady(false);   // вимкнути рендер
      const response = await axiosInstance.post('/classify-columns', {
        data: rawData,
      });

      const { columns, data } = response.data;

      setColumnNames(columns);
      setDisplayData(data);
      setRenamed(true);
      setIsReady(true);
    } catch (error) {
      console.error('Помилка при класифікації колонок:', error);
      setIsReady(true);
    }
  };

  // --- 4. Вибір ключа для перерендеру ---
  const previewKey = renamed ? 'renamed' : 'original';

  // --- 5. Оптимізація ---
  const previewData = useMemo(() => displayData, [displayData]);
  const previewColumns = useMemo(() => columnNames, [columnNames]);

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
        <button onClick={renameColumns} disabled={renamed} style={{ marginRight: 10 }}>
          📝 Назвати колонки вручну
        </button>
        <button onClick={classifyColumns}>
          🧠 Автокласифікація колонок
        </button>
      </div>

      <h3 style={{ marginTop: 40 }}>Попередній перегляд таблиці</h3>
      <div style={{ height: '500px' }}>
        {isReady && displayData.length > 0 ? (
          <DataPreview
            key={previewKey}
            data={previewData}
            columns={previewColumns}
          />
        ) : (
          <p>Завантаження даних або немає що показати...</p>
        )}
      </div>
    </div>
  );
};

export default DataAnalysisPage;
