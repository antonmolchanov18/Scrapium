import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { Level } from 'level';

app.on('ready', () => {
  const tasksDb = new Level(path.join(app.getAppPath(), 'data', 'tasks'));

  const mainWindow = new BrowserWindow({
    frame: false,
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: getPreloadPath(),
    },
  });
  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
  }

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      // Якщо вікно вже максимізоване, відновлюємо його розмір
      mainWindow.restore();
    } else {
      // Якщо вікно не максимізоване, максимізуємо його
      mainWindow.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });
})