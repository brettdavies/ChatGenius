export type DatabaseOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface DatabaseEvent<T = any> {
  channel: string;
  operation: DatabaseOperation;
  schema: string;
  table: string;
  data: T;
}

export interface EventEmitter {
  notify(channel: string, data: any): void;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
} 