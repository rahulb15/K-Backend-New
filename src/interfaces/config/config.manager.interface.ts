import { IConfig } from "./config.interface";
import { Types } from "mongoose";

export interface IConfigManager {
  create(config: IConfig): Promise<IConfig>;
  getAll(): Promise<IConfig[]>;
  getById(id: string): Promise<IConfig>;
  getByKey(key: string): Promise<IConfig | null>;
  update(id: Types.ObjectId, config: IConfig): Promise<IConfig>;
}
