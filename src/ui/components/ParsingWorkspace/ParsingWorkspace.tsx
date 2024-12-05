import React, { useEffect, useState, useLayoutEffect  } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabState, addTab } from '../../store/tabSlice';
import { RootState } from '../../store';
import Switch from "react-switch";
import './ParsingWorkspace.scss';

import ArrowBackIcon from '../../assets/icons/arrow-back-icon.svg?react';
import ArrowNextIcon from '../../assets/icons/arrow-next-icon.svg?react';
import ReloadIcon from '../../assets/icons/reload-icon.svg?react';
import { DataPreview } from '../DataPreview/DataPreview';

export const ParsingWorkspace = () => {
  const [preloadPath, setPreloadPath] = useState<string | null>(null);
  const [parsingData, setParsingData] = useState<any[]>([]);
  
  const { state } = useLocation();
  const dispatch = useDispatch();

  const taskKey = state?.key;
  
  useEffect(() => {
    const setTaskKey = async () => {
      if (taskKey) {
        await window.API.setCurrentTaskKey(taskKey);
      }
    };
    setTaskKey();
  }, [taskKey]);

  // Retrieve the current tab
  const tab = useSelector((state: RootState) =>
    state.tabs.tabs.find((tab) => tab.task.key === taskKey)
  );
  console.log('TAB', tab);

  // UseEffect to fetch preloadPath
  useEffect(() => {
    const fetchPreloadPath = async () => {
      try {
        setPreloadPath(await window.API.getPreloadPath());
      } catch (error) {
        console.error("Error fetching preload path:", error);
      }
    };

    fetchPreloadPath();
  }, []);

  // UseLayoutEffect to configure webview
  useLayoutEffect(() => {
    const webview = document.getElementById("my-webview") as HTMLWebViewElement;
    if (webview) {
      const onDomReady = () => {
        //@ts-ignore
        webview.send("taskKey", taskKey);
        console.log("WebView is ready");
        // @ts-ignore
        webview.executeJavaScript(`
          const matchedElements = []; // Масив для збереження селекторів
          let taskKey = null;
        
          // Отримання taskKey
          window.addEventListener('message', (event) => {
            if (event.data.taskKey) {
              taskKey = event.data.taskKey;
              console.log('Task Key:', taskKey);
            }
          });
        
          // Функція для генерації селектора
          function generateSelector(el) {
            let selector = el.tagName.toLowerCase();
            if (el.id) selector += '#' + el.id;
            if (el.classList.length > 0) selector += '.' + Array.from(el.classList).join('.');
            return selector;
          }
        
          // Обробка кліку
          document.addEventListener('click', (event) => {
            event.preventDefault();
            const element = event.target;
            const selector = generateSelector(element);
        
            if (!matchedElements.includes(selector)) {
              matchedElements.push(selector);
              element.style.border = '2px solid green'; // Підсвічуємо елемент
              window.API.postSelectors(selector); // Надсилаємо селектор
            } else {
              matchedElements.splice(matchedElements.indexOf(selector), 1);
              element.style.border = ''; // Забираємо підсвічення
              window.API.postSelectors(selector); // Можливо, видаляємо селектор на сервері
            }
        
            console.log('Selected Elements:', matchedElements);
          });
        `)
          .then(() => console.log("JavaScript executed"))
          .catch(() => console.error("Error executing JavaScript"));
      };

      webview.addEventListener("new-window", (event) => {
        //@ts-ignore
        console.log("Preventing navigation to:", event.url); // Логування URL
        event.preventDefault(); // Не дозволяти переходи за посиланнями
      });

      // Запобігти всім навігаціям
      webview.addEventListener("will-navigate", (event) => {
        //@ts-ignore
        console.log("Preventing navigation to:", event.url); // Логування URL
        // Повертаємось до початкового URL
        //@ts-ignore
        webview.loadURL(webview.src); // Завантажити початковий URL
      });
      
      webview.addEventListener("dom-ready", onDomReady);
      return () => webview.removeEventListener("dom-ready", onDomReady);
    } else {
      console.log("WebView element not found.");
    }
  }, [preloadPath]);

  // Handlers for input and switch changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateTabState({ key: taskKey, inputValue: event.target.value, switchValue: tab?.switchValue || false }));
  };

  const handleSwitchChange = (checked: boolean) => {
    dispatch(updateTabState({ key: taskKey, inputValue: tab?.inputValue || "", switchValue: checked }));
  };

  const startParser = async (key: string) => {
    try {
      const result = await window.API.startParser(key);
      console.log("Parser started successfully:", result);
      // Assuming the result is in the format [{field_1: Array(1)}, {field_2: Array(179)}, {field_3: Array(179)}]
      setParsingData(result); // Update the state with the parsing result
    } catch (error) {
      console.error("Error starting parser:", error);
    }
  };

  // Render JSX
  return (
    <div className="parser-workplace">
      {!tab ? (
        <div>Tab not found</div>
      ) : (
        <>
          <div className="parser-workplace__header">
            <p className="parser-workplace__title">{tab.task.data.title}</p>

            <div className="parser-workplace__navigation">
              <div className="parser-workplace__navigation-buttons">
                <ArrowBackIcon className="icon icon--medium" />
                <ArrowNextIcon className="icon icon--medium" />
                <ReloadIcon className="icon icon--medium" />
              </div>

              <form className="parser-workplace__form">
                <input
                  type="text"
                  className="input-search"
                  placeholder="Enter URL"
                  value={tab.inputValue || ""}
                  onChange={handleInputChange}
                />

                <Switch
                  onChange={handleSwitchChange}
                  checked={tab.switchValue || false}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  handleDiameter={12}
                  height={20}
                  width={38}
                  offColor={"#898989"}
                  onColor={"#1591EA"}
                />
              </form>
            </div>

            <button className="parser-workplace__button button" onClick={() => startParser(taskKey)}>run</button>
          </div>

          {preloadPath ? (
            <webview
              id="my-webview"
              src={tab.task.data.url}
              className="parser-workplace__browser"
              preload={preloadPath}
            ></webview>
          ) : (
            <div>Loading WebView...</div>
          )}

          <div className="parser-workplace__preview">
            <DataPreview data={parsingData}/>
          </div>

          <div className="parser-workplace__setup"></div>
        </>
      )}
    </div>
  );
};