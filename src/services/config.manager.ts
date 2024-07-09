import mongoose from "mongoose";
import { IConfig } from "../interfaces/config/config.interface";
import { IConfigManager } from "../interfaces/config/config.manager.interface";
import Config from "../models/config.model";

export class ConfigManager implements IConfigManager {
  private static instance: ConfigManager;

  // private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }

    return ConfigManager.instance;
  }

  public async create(config: IConfig): Promise<IConfig> {
    const newConfig = new Config(config);
    return newConfig.save();
  }

  public async getAll(): Promise<IConfig[]> {
    return Config.find();
  }

  public async getById(id: string): Promise<IConfig> {
    const config = await Config.findById(id);
    if (!config) {
      throw new Error("Config not found");
    }
    return config;
  }

  public async getByKey(key: string): Promise<IConfig> {
    console.log(key);
    const config = await Config.findOne({ key });
    console.log(config);
    return config as IConfig;
  }

  public async update(
    id: mongoose.Types.ObjectId,
    config: IConfig
  ): Promise<IConfig> {
    const updatedConfig = await Config.findByIdAndUpdate(id, config, {
      new: true,
    });
    if (!updatedConfig) {
      throw new Error("Config not found");
    }
    return updatedConfig;
  }
}

export default ConfigManager.getInstance();
