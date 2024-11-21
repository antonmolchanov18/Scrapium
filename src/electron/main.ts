import { app } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { WindowManager } from './WindowManager/WindowManager.js';
import { EventManager } from './EventManager/EventManager.js';
import Database from './Database/Database.js';

export class MainApp {
  private windowManager: WindowManager;
  private eventManager: EventManager;
  private Task: Database;

  constructor() {
    this.windowManager = new WindowManager();
    this.eventManager = new EventManager();
    this.Task = new Database(path.join(app.getAppPath(), '/data/tasks'));
    app.on('ready', this.initializeApp);
  }

  private initializeApp = async (): Promise<void> => {
    try {
      this.Task.open();
      const mainWindow = await this.windowManager.createMainWindow(
        isDev() ? 'http://localhost:5123' : path.join(app.getAppPath(), '/dist-react/index.html')
      );
      this.eventManager.registerWindowEvents(mainWindow);
      console.log('Application initialized successfully');
    } catch (err) {
      console.error('Initialization failed:', err);
      app.quit();
    }
  };
}

new MainApp();