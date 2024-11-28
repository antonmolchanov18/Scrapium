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
        console.log("WebView is ready");
        webview
          //@ts-ignore
          .executeJavaScript(`window.API.createTask({"dasd": "asdasd"})`)
          .then(() => console.log("JavaScript executed"))
          .catch(() => console.error("Error executing JavaScript"));
      };

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

            <button className="parser-workplace__button button">save</button>
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