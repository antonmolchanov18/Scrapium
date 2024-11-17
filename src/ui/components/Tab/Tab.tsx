import cn from 'classnames';

import TabCloseIcon from '../../assets/icons/tab-close-icon.svg?react';

interface TabItemProps {
  data: {
    id: number;
    name: string;
    isActive: boolean;
  };
  closeTab: (id: number) => void;
  activateTab: (id: number) => void;
}

export const Tab = ({ data, closeTab, activateTab }: TabItemProps) => (
  <li className={cn('tab__item', { 'tab__item--active': data.isActive })} onClick={() => { activateTab(data.id) }}>
    <p className='tab__text'>
      {data.name}
    </p>

    {data.isActive && <TabCloseIcon className='tab__close-icon icon--small' onClick={() => { closeTab(data.id) }}/>}
  </li>
);