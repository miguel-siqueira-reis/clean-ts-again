import { Db } from '@/Main/types';
import { Collection, MongoClient } from 'mongodb';

export class MongoDb implements Db {
  private url: string;
  private client: MongoClient;

  constructor(url = process.env.MONGO_URL as string) {
    this.url = url;
    this.client = {} as MongoClient;
  }

  public async connect(url?: string): Promise<void> {    
    this.client = new MongoClient(url ?? this.url);
    await this.client.connect(); 
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }

  public getCollection(name: string): Collection  {
    return this.client.db().collection(name);
  }

  public map<T>(data: any): T {
    const { _id, ...rest } = data;
    return Object.assign({}, rest, { id: _id });
  }

  public getDatabase() {
    return this.client.db();
  }
}

export const db = new MongoDb();