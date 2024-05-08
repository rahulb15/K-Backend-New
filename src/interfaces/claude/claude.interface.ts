import { Types } from "mongoose";
import { IClaudeChats } from "./claude.chats.interface";
export interface IClaude {
  _id?: string;
  user: Types.ObjectId;
  chats: IClaudeChats[];
  createdAt?: Date;
  updatedAt?: Date;
}
