import { IUserPoints } from "./userpoints.interface";

export interface IUserPointsManager {
  create(userPoints: IUserPoints): Promise<IUserPoints>;
  getAll(): Promise<IUserPoints[]>;
  getByUserId(userId: string): Promise<IUserPoints>;
}
