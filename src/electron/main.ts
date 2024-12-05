import { app, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { WindowManager } from './WindowManager/WindowManager.js';
import { EventManager } from './EventManager/EventManager.js';
import Database from './Database/Database.js';
import { getPreloadPath } from './pathResolver.js';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import puppeteer from 'puppeteer';

export class MainApp {
  private windowManager: WindowManager;
  private eventManager: EventManager;
  private TasksDb: Database;
  private SelectorsDb: Database;
  private ParserDb: Database;
  private currentTaskKey: string | null = null;
  private userTimeZone: string;

  constructor() {
    this.windowManager = new WindowManager();
    this.eventManager = new EventManager();
    this.TasksDb = new Database(path.join('/dist-electron/data/tasks'));
    this.SelectorsDb = new Database(path.join('/dist-electron/data/selectors'));
    this.ParserDb = new Database(path.join('/dist-electron/data/parser'));
    this.userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
        if (await this.TasksDb.isEmpty()) {
          const key = this.TasksDb.create32BitKey(0)
          const createdDate = new Date().toLocaleString(undefined, { timeZone: this.userTimeZone });

          const taskData = {
            ...data,
            createdDate,
            status: 'Pending',
          }

          await this.TasksDb.put(key, taskData);
          await this.SelectorsDb.put(key, []);

          return {
            key: key,
            data: await this.TasksDb.get(key),
          };
        } else {
          
          const lastRecord = await this.TasksDb.getLastRecord();
          let lastKey: number = this.TasksDb.decode32BitKey(lastRecord.key);
          const key = this.TasksDb.create32BitKey(lastKey + 1);
          const createdDate = new Date().toLocaleString(undefined, { timeZone: this.userTimeZone });

          const taskData = {
            ...data,
            createdDate,
            status: 'Pending',
          }

          await this.TasksDb.put(key, taskData);
          await this.SelectorsDb.put(key, []);


          return {
            key: key,
            data: await this.TasksDb.get(key),
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
    });

    ipcMain.handle('selectors:get-one', async (event, key) => {
      try {
        const selector = await this.SelectorsDb.get(key);

        return selector;
      } catch (error) {
        return false;
      }
    });

    ipcMain.handle('task:set-current', async (event, key) => {
      try {
        this.currentTaskKey = key;

        return this.currentTaskKey;
      } catch (error) {
        return false;
      }
    });

    ipcMain.handle('task:delete', async (event, key) => {
      try {
        const deleteTask = await this.TasksDb.delete(key);
        await this.SelectorsDb.delete(key);
        await this.ParserDb.delete(key);

        return deleteTask;
      } catch (error) {
        return false;
      }
    });


    ipcMain.handle('preload:get-path', async (event, key) => {
      try {
        const preloadPath = getPreloadPath();
        const formattedPath = preloadPath.replace(/\\/g, '/');
        const fullPath = 'file://' + formattedPath;

        if (fs.existsSync(preloadPath)) {
          console.log('File Preload');

          return fullPath;
        } else {
          return null;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    });

    ipcMain.handle('parser:get-selectors', async (event, selectors) => {
      try {
        if (this.currentTaskKey === null) {
          console.error('currentTaskKey is null');
          return false;
        }

        const storedSelectors = await this.SelectorsDb.get(this.currentTaskKey);

        if (!Array.isArray(storedSelectors)) {
          console.error('Stored selectors are not an array');
          return false;
        }
        console.log("SELECTOR", selectors);

        const index = storedSelectors.indexOf(selectors);

        if (index === -1 && selectors !== undefined) {
          // Якщо селектор не знайдений, додаємо його в масив
          console.log(selectors);

          storedSelectors.push(selectors);
        } else if (index !== -1) {
          // Якщо селектор існує, видаляємо його з масиву
          storedSelectors.splice(index, 1);
        }

        // Зберігаємо оновлений масив селекторів у базі даних
        await this.SelectorsDb.put(this.currentTaskKey, storedSelectors);

        const task = await this.TasksDb.get(this.currentTaskKey);
        await this.TasksDb.put(this.currentTaskKey, { ...task, status: 'Ready', message: 'Selectors are ready for parsing.' });

        console.log('Updated selectors:', storedSelectors);
        return storedSelectors; // Повертаємо оновлений масив
      } catch (error) {
        console.error(error);
        return false; // Повертаємо false, якщо сталася помилка
      }
    });

    ipcMain.handle('parser:start', async (event, key) => {
      try {
        const selectors = await this.SelectorsDb.get(key);
        if (!selectors || !Array.isArray(selectors)) {
          console.error('No valid selectors found for task.');
          const task = await this.TasksDb.get(key);
          await this.TasksDb.put(key, { ...task, status: 'Error', message: 'No valid selectors found.' });
          return false;
        }
    
        const task = await this.TasksDb.get(key);
        if (!task || !task.url) {
          console.error('No valid task URL found.');
          await this.TasksDb.put(key, { ...task, status: 'Error', message: 'No valid task URL found.' });
          return false;
        }
    
        // Оновлюємо статус на "в процесі", зберігаючи інші дані задачі
        await this.TasksDb.put(key, { ...task, status: 'Running', message: 'Task is in progress.' });
    
        const browser = await puppeteer.launch({ headless: false, slowMo: 200 });
        const page = await browser.newPage();
    
        // Переходимо на URL завдання
        await page.goto(task.url, { waitUntil: 'domcontentloaded' });
    
        // Збираємо дані
        const data = await Promise.all(
          selectors.map(async (selector, index) => {
            try {
              const keyName = `field_${index + 1}`;
              const texts = await page.$$eval(selector, (elements) => {
                return elements.map((el) => (el instanceof HTMLElement ? el.innerText.trim() : null));
              });
    
              const filteredTexts = texts.filter(text => text && text.trim().length > 0);
              return { [keyName]: filteredTexts };
            } catch (error) {
              console.error(`Error processing selector "${selector}":`, error);
              return { selector, texts: [] };
            }
          })
        );
    
        console.log('Parsed data:', data);
    
        // Зберігаємо результат
        await this.ParserDb.put(key, data);
    
        // Оновлюємо статус на "завершено"
        await this.TasksDb.put(key, { ...task, status: 'Completed', message: 'Task completed successfully.' });
    
        await browser.close();
        return data; // Повертаємо результат парсингу
      } catch (error) {
        console.error('Error in parser:start:', error);
    
        // Оновлюємо статус на "помилка", зберігаючи інші дані задачі
        const task = await this.TasksDb.get(key);
        await this.TasksDb.put(key, { ...task, status: 'Error', message: 'Error'});
        return false;
      }
    });
    
    

    ipcMain.handle('parser:get-data', async (event, key) => {
      try {
        return await this.ParserDb.get(key);
      } catch (error) {
        console.error(error);
        return false;
      }
    });
  }
}

new MainApp();