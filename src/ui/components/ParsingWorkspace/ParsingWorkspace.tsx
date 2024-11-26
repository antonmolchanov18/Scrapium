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
  const { state } = useLocation();
  const dispatch = useDispatch();
  
  const taskKey = state?.key;

  const tab = useSelector((state: RootState) =>
    state.tabs.tabs.find(tab => tab.task.key === taskKey)
  );
  
  if (!tab) {
    return ;
  }
  
  const { task } = tab;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateTabState({ key: taskKey, inputValue: event.target.value, switchValue: tab.switchValue }));
  };

  const handleSwitchChange = (checked: boolean) => {
    dispatch(updateTabState({ key: taskKey, inputValue: tab.inputValue, switchValue: checked }));
  };

  return (
    <div className="parser-workplace">
      <div className="parser-workplace__header">
        <p className='parser-workplace__title'>{task.data.title}</p>

        <div className='parser-workplace__navigation'>
          <div className='parser-workplace__navigation-buttons'>
            <ArrowBackIcon className='icon'/>
            <ArrowNextIcon className='icon'/>
            <ReloadIcon className='icon'/>
          </div>

          <form className='parser-workplace__form'>
            <input
              type="text" 
              className='input-search'
              placeholder='Enter URL'
              value={tab.inputValue}
              onChange={handleInputChange}
            />
            
            <Switch
              onChange={handleSwitchChange}
              checked={tab.switchValue}
              uncheckedIcon={false}
              checkedIcon={false}
              handleDiameter={12}
              height={20}
              width={38}
              offColor={'#898989'}
              onColor={'#1591EA'}
            />
          </form>
        </div>

        <button className='parser-workplace__button button'>save</button>
      </div>

      <webview src={task.data.url} className='parser-workplace__browser'></webview>

      <div className="parser-workplace__preview">
        <DataPreview />
      </div>

      <div className="parser-workplace__setup">
        
      </div>
    </div>
  )
};