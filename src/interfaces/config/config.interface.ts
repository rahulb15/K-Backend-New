import { Types } from 'mongoose';

export interface IConfig {
  _id?: string;
  key: string;
  value: any;
  name?: string;
  description?: string;
  group?: string;
  public?: boolean;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
