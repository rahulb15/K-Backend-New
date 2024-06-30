import mongoose from "mongoose";
import { IConfig } from "../interfaces/config/config.interface";

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  name: { type: String },
  description: { type: String },
  group: { type: String, default: "system", required: true },
  public: { type: Boolean, default: false },
  type: {
    type: String,
    default: "text",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Config = mongoose.model<IConfig & mongoose.Document>(
  "Config",
  configSchema
);

export default Config;
