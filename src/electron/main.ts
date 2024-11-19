import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { Level } from 'level';

class MainWindow {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    app.on('ready', () => this.createWindow());
  }

  private createWindow = (): void => {
    if (this.mainWindow) return;

    this.mainWindow = new BrowserWindow({
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
      this.mainWindow.loadURL('http://localhost:5123');
    } else {
      this.mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

    this.registerEvents();
  };

  private registerEvents = (): void => {
    if (!this.mainWindow) return;

    ipcMain.on('minimize-window', (event: Electron.IpcMainEvent) => {
      this.mainWindow?.minimize();
    });

    ipcMain.on('maximize-window', (event: Electron.IpcMainEvent) => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.restore();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.on('close-window', (event: Electron.IpcMainEvent) => {
      this.mainWindow?.close();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  };
}

new MainWindow();
