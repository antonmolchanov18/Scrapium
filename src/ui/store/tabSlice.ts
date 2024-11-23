import { createSlice, PayloadAction  } from '@reduxjs/toolkit';

interface Tab {
  task: Task;
  isActive: boolean;
}

interface TaskData {
  title: string;
  url: string;
}

interface Task {
  key: string;
  data: TaskData;
}

interface TabsState {
  tabs: Array<Tab>;
}

const initialState: TabsState = {
  tabs: [],
};

console.log(initialState);


const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<{ task: Task, isActive: boolean; }>) => {
      state.tabs.forEach(tab => {
        tab.isActive = false;
      });

      state.tabs.push({ ...action.payload, isActive: true });
    },

    openTab: (state, action: PayloadAction<string>) => {
      state.tabs.forEach(tab => {
        tab.isActive = false;
      });

      const tab = state.tabs.find(tab => tab.task.key === action.payload);
      if (tab) {
        tab.isActive = true;
      }
    },
    
    closeTab: (state, action: PayloadAction<string>) => {
      const tabIndex = state.tabs.findIndex(tab => tab.task.key === action.payload);
      
      if (tabIndex !== -1) {

        state.tabs.splice(tabIndex, 1);

        if (state.tabs.length > 0) {
          const lastTab = state.tabs[state.tabs.length - 1];
          lastTab.isActive = true;
        }
      }
    },
  },
})

export const { addTab, openTab, closeTab } = tabsSlice.actions;

export default tabsSlice.reducer;