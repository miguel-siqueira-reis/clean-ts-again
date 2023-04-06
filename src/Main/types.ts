export interface App {
  start(): Promise<void>;
  teardown(): Promise<void>;

  getServer(): any;
}

export interface Db {
  connect(url?: string): Promise<void>;
  disconnect(): Promise<void>;
  getDatabase(): any;
}