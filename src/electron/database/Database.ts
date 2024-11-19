import { Level } from 'level';

export default class Database {
  private db: Level<string, any>;

  constructor(databasePath: string, encoding: string = 'json') {
    this.db = new Level(databasePath, { valueEncoding: encoding });
  }

  async put(key: string, value: any, onError?: (error: any) => void): Promise<void> {
    try {
      await this.db.put(key, value);
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        console.error('Error saving data:', err);
      }
      throw err;
    }
  }

  async get(key: string, onError?: (error: any) => void): Promise<any> {
    try {
      const value = await this.db.get(key);
      return value;
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        console.error('Error retrieving data:', err);
      }
      throw err;
    }
  }

  async delete(key: string, onError?: (error: any) => void): Promise<void> {
    try {
      await this.db.del(key);
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        console.error('Error deleting data:', err);
      }
      throw err;
    }
  }

  async has(key: string, onError?: (error: any) => void): Promise<boolean> {
    try {
      await this.db.get(key);
      return true;
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        console.error('Error checking existence of key:', err);
      }
      return false;
    }
  }

  async close(onError?: (error: any) => void): Promise<void> {
    try {
      await this.db.close();
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        console.error('Error closing database:', err);
      }
      throw err;
    }
  }
}
