import { IConfig } from "../../interfaces/config/config.interface";

export const configResponseData = (config: IConfig) => {
  return {
    _id: config._id,
    key: config.key,
    value: config.value,
    name: config.name,
    description: config.description,
    group: config.group,
    public: config.public,
    type: config.type,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
};
