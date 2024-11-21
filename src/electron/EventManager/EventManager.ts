import { ipcMain, BrowserWindow } from 'electron';

export class EventManager {
  public registerWindowEvents(mainWindow: BrowserWindow): void {
    ipcMain.on('minimize-window', () => mainWindow.minimize());
    ipcMain.on('maximize-window', () => {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    });
    ipcMain.on('close-window', () => mainWindow.close());
  }
}
