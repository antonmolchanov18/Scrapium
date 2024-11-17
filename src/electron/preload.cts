const { contextBridge, ipcRenderer, } = require('electron');

contextBridge.exposeInMainWorld('API', {
  subcribeStatics: (callback: (statistics: any) => void) => callback({}),
  getStaticData: () => console.log('static'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
})