import { useState } from 'react';

import './Tabs.scss';

import { Tab } from '../Tab/Tab';

interface Tab {
  id: number;
  name: string;
  isActive: boolean;
}

const tabData: Tab[] = [
  { id: 1, name: 'Home', isActive: true },
  { id: 2, name: 'Rozetka', isActive: false },
  { id: 3, name: 'Amazon', isActive: false },
];

export const Tabs = () => {
  const [tabs, setTabs] = useState<Tab[]>(tabData);

  const closeTab = (id: number) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
  };

  const activateTab = (id: number) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === id ? { ...tab, isActive: true } : { ...tab, isActive: false }
      )
    );
  };

  return (
    <div className="tab">
      <ul className='tab__list'>
        {tabs.map(data => (
          <Tab
            data={data}
            closeTab={closeTab}
            activateTab={activateTab}
            key={data.id}
          />
        ))}
      </ul>
    </div>
  )
};