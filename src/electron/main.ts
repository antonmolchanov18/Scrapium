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
    this.TasksDb = new Database(path.join('/dist-electron/data/tasks'));
    this.KeyDb = new Database(path.join(app.getAppPath(), '/data/keys'));
    app.on('ready', this.initializeApp);
    this.registerHandlers();
  }

  private initializeApp = async (): Promise<any> => {
    try {
      console.log(path.join(app.getAppPath(), '/dist-electron/data/tasks'));
      
      console.log(this.TasksDb);
      
      this.TasksDb.open();
      const mainWindow = await this.windowManager.createMainWindow(
        isDev() ? 'http://localhost:5123' : path.join(app.getAppPath(), '/dist-react/index.html')
      );
      this.eventManager.registerWindowEvents(mainWindow);
      return 'Database open';
    } catch (err) {
      console.error('Initialization failed:', err);
      app.quit();
    }
  };

  async registerHandlers() {
    ipcMain.handle('task:create', async (event, data: any) => {
      try {
        console.log('Received task data:', data);
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
        return error;
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

    ipcMain.handle('task:get-one', async (event, key) => {
      try {
        const task = await this.TasksDb.get(key);

        return task;
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