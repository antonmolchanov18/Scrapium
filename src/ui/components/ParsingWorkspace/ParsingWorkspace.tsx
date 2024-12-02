import React, { useEffect, useState, useLayoutEffect  } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabState } from '../../store/tabSlice';
import { RootState } from '../../store';
import Switch from "react-switch";
import './ParsingWorkspace.scss';

import ArrowBackIcon from '../../assets/icons/arrow-back-icon.svg?react';
import ArrowNextIcon from '../../assets/icons/arrow-next-icon.svg?react';
import ReloadIcon from '../../assets/icons/reload-icon.svg?react';
import { DataPreview } from '../DataPreview/DataPreview';

export const ParsingWorkspace = () => {
  const [preloadPath, setPreloadPath] = useState<string | null>(null);
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
        //@ts-ignore
        webview.openDevTools();
        // @ts-ignore
        webview.executeJavaScript(`
          const matchedElements = []; // Масив для збереження селекторів елементів
          
          let taskKey = null;
          
          window.addEventListener('message', function(event) {
            if (event.data.taskKey) {
              taskKey = event.data.taskKey; // Призначаємо taskKey
              console.log(taskKey);
            }
          });
          
          document.addEventListener('click', function (event) {
            const element = event.target; // Елемент, який натиснули
            event.preventDefault();
            // Функція для перевірки, чи елемент містить текст
            function isTextOnlyElement(el) {
              return el.nodeType === Node.TEXT_NODE && el.textContent.trim() !== '';
            }

            // Функція для генерації селектора на основі елементу
            function generateSelector(elementInfo) {
              let selector = elementInfo.tagName ? elementInfo.tagName.toLowerCase() : ''; // Додаємо тег, якщо є

              // Додаємо ID, якщо не null і не порожній
              if (elementInfo.id) {
                selector += \`#\${elementInfo.id}\`;
              }

              // Додаємо класи, якщо не null і є хоча б один клас
              if (elementInfo.classList && elementInfo.classList.length > 0) {
                selector += \`.\${elementInfo.classList.join('.')}\`;
              }

              // Додаємо data-атрибути, якщо вони не null
              if (elementInfo.dataAttributes) {
                for (const [key, value] of Object.entries(elementInfo.dataAttributes)) {
                  if (value) {
                    selector += \`[data-\${key}="\${value}"]\`;
                  }
                }
              }

              return selector || null; // Повертаємо селектор або null, якщо не вдалося створити
            }

            // Функція для збереження або видалення інформації про елемент
            function toggleElementInfo(el) {
              const elementInfo = {
                tagName: el.tagName,
                id: el.id || null,
                classList: [...el.classList].length === 0 ? null : [...el.classList],
                dataAttributes: Object.keys(el.dataset).length > 0 ? el.dataset : null,
            };

            const selector = generateSelector(elementInfo); // Генеруємо селектор

            if (selector) {
              const index = matchedElements.indexOf(selector);
              if (index === -1) {
                  matchedElements.push(selector); // Додаємо селектор у масив, якщо його ще немає
                  window.API.postSelectors(selector)
              } else {
                  matchedElements.splice(index, 1); // Видаляємо селектор з масиву, якщо він вже є
                  el.style.border = '';
                  window.API.postSelectors(selector)
                }
              }
            }

            // Функція для перевірки, чи елемент містить тільки текст
            function checkElement(el) {
              if (el.nodeType === Node.ELEMENT_NODE) {
                for (let child of el.childNodes) {
                  if (isTextOnlyElement(child)) {
                    el.style.border = '1px solid green'; // Підсвічуємо елемент
                    toggleElementInfo(el); // Зберігаємо або видаляємо селектор елементу
                    break; // Досить, якщо знайдено хоча б один текстовий нащадок
                  }
                }
              }
            }

            // Перевіряємо нащадків елемента
            function checkDescendants(el) {
              checkElement(el); // Перевіряємо сам елемент

              // Перевіряємо всі дочірні елементи
              for (let child of el.childNodes) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                  checkDescendants(child); // Рекурсивно перевіряємо кожного нащадка
                }
              }
            }

            // Починаємо перевірку з натискання на елемент
            checkDescendants(element);

            console.log(matchedElements); // Для перевірки результату у консолі
          });`)
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
            <DataPreview />
          </div>

          <div className="parser-workplace__setup"></div>
        </>
      )}
    </div>
  );
};