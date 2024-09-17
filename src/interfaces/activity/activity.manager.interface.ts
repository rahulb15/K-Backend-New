import { Types } from "mongoose";
import { INftActivity } from "./activity.interface";

export interface INftActivityManager {
  create(activity: INftActivity): Promise<INftActivity>;
  getAll(): Promise<INftActivity[]>;
  getById(id: string): Promise<INftActivity>;
  update(id: Types.ObjectId, activity: INftActivity): Promise<INftActivity>;
}
