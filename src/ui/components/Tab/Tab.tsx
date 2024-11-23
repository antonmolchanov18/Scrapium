import { useDispatch } from 'react-redux';
import cn from 'classnames';
import { openTab, closeTab } from '../../store/tabSlice';
import { useNavigate } from 'react-router-dom';

import TabCloseIcon from '../../assets/icons/tab-close-icon.svg?react';

export const Tab = ({ task, isActive }: TabItemProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTabClick = () => {
    dispatch(openTab(task.key));
    navigate('/');
  };

  const handleTabClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(closeTab(task.key));
  };

  return (
    <li className={cn('tab__item', { 'tab__item--active': isActive })} onClick={handleTabClick}>
      <p className='tab__text'>
        {task.data.title.slice(0, 10) + '...'}
      </p>

      {isActive && <TabCloseIcon className='tab__close-icon icon--small' onClick={handleTabClose}/>}
    </li>
  )
};