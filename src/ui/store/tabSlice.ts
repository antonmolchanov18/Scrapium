import { createSlice, PayloadAction  } from '@reduxjs/toolkit';

interface Tab {
  task: Task;
  isActive: boolean;
  inputValue: string;
  switchValue: boolean;
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
      const { task } = action.payload;

      if (!task.key || !task.data) {
        console.error('Invalid task provided:', task);
        return;
      }

      console.log('Task redux', action.payload);
      
      state.tabs.forEach(tab => {
        tab.isActive = false;
      });

      state.tabs.push({
        task,
        isActive: true,
        inputValue: '',
        switchValue: false,
      });
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

        
      }
    },

    updateTabState: (
      state,
      action: PayloadAction<{ key: string; inputValue: string; switchValue: boolean }>
    ) => {
      const { key, inputValue, switchValue } = action.payload;
      console.log(key);
      
      const tab = state.tabs.find(tab => tab.task.key === key);
      console.log('This tab', JSON.parse(JSON.stringify(state.tabs)));
      

      if (tab) {
        tab.inputValue = inputValue;
        tab.switchValue = switchValue;
      }
    },
  },
})

export const { addTab, openTab, closeTab, updateTabState } = tabsSlice.actions;

export default tabsSlice.reducer;