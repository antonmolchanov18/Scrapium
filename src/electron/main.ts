import { app, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { WindowManager } from './WindowManager/WindowManager.js';
import { EventManager } from './EventManager/EventManager.js';
import Database from './Database/Database.js';

export class MainApp {
  private windowManager: WindowManager;
  private eventManager: EventManager;
  private TasksDb: Database;
  private KeyDb: Database;

  constructor() {
    this.windowManager = new WindowManager();
    this.eventManager = new EventManager();
    this.TasksDb = new Database(path.join(app.getAppPath(), '/data/tasks'));
    this.KeyDb = new Database(path.join(app.getAppPath(), '/data/keys'));
    app.on('ready', this.initializeApp);
    this.registerHandlers();
  }

  private initializeApp = async (): Promise<void> => {
    try {
      this.TasksDb.open();
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

  async registerHandlers() {
    console.log(await this.TasksDb.get("34000000"));
    
    ipcMain.handle('task:create', async (event, data: any) => {
      console.log(data);
      
      try {
        if (await this.TasksDb.isEmpty()) {
          const key = this.TasksDb.create32BitKey(0)
          await this.TasksDb.put(key, data);

          return {
            key: key,
            data: await this.TasksDb.get(key)
          };
        } else {
          const lastRecord = await this.TasksDb.getLastRecord();
          let lastKey: number = this.TasksDb.decode32BitKey(lastRecord.key);
          const key = this.TasksDb.create32BitKey(lastKey + 1);
          await this.TasksDb.put(key, data);

          return {
            key: key,
            data: await this.TasksDb.get(key)
          };
        }
      } catch (error) {
        return false;
      }
    });

    ipcMain.handle('task:get-all', async (event) => {
      try {
        const allTasks = await this.TasksDb.readAll();

        return allTasks;
      } catch (error) {
        return false;
      }
    })

    ipcMain.handle('task:get-delete', async (event, key) => {
      try {
        const allTasks = await this.TasksDb.delete(key);

        return allTasks;
      } catch (error) {
        return false;
      }
    });
  }
}

new MainApp();