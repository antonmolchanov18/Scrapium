import { Level } from 'level';

export default class Database {
  private db: Level<string, any>;

  constructor(databasePath: string, encoding: string = 'json') {
    this.db = new Level(databasePath, { valueEncoding: encoding });
  }

  private async handleError(err: any, onError?: (error: any) => void, methodName?: string): Promise<void> {
    if (onError) {
      onError(err);
    } else {
      console.error(`Error in ${methodName}:`, err);
    }
    throw err;
  }

  async put(key: string, value: any, onError?: (error: any) => void): Promise<void> {
    try {
      await this.db.put(key, value);
    } catch (err) {
      await this.handleError(err, onError);
    }
  }

  async get(key: string, onError?: (error: any) => void): Promise<any> {
    try {
      const value = await this.db.get(key);
      return value;
    } catch (err) {
      await this.handleError(err, onError);
    }
  }

  async delete(key: string, onError?: (error: any) => void): Promise<void> {
    try {
      await this.db.del(key);
    } catch (err) {
      await this.handleError(err, onError);
    }
  }

  async has(key: string, onError?: (error: any) => void): Promise<boolean> {
    try {
      await this.db.get(key);
      return true;
    } catch (err) {
      await this.handleError(err, onError);
      return false;
    }
  }

  async close(onError?: (error: any) => void): Promise<void> {
    try {
      await this.db.close();
    } catch (err) {
      await this.handleError(err, onError);
    }
  }
}
