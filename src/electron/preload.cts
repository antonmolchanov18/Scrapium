const electron = require('electron');

electron.contextBridge.exposeInMainWorld('API', {
  subcribeStatics: (callback: (statistics: any) => void) => callback({}),
  getStaticData: () => console.log('static'),
})