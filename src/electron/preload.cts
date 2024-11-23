const { contextBridge, ipcRenderer, } = require('electron');

contextBridge.exposeInMainWorld('API', {
  getStaticData: async () => {
    // This will request static data from the main process
    try {
      const data = await ipcRenderer.invoke('get-all-tasks');
      return data;
    } catch (err) {
      console.error('Error fetching static data:', err);
      return null;
    }
  },
  subcribeStatics: (callback: (statistics: any) => void) => callback({}),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  createTask: (taskData: any) => ipcRenderer.invoke('task:create', taskData),
  deleteTask: (key: any) => ipcRenderer.invoke('task:delete', key),
  getAllTask: () => ipcRenderer.invoke('task:get-all'),
  getTask: (key: any) => ipcRenderer.invoke('task:get-one', key),
})