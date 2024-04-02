import { IUser } from './user.interface';
export interface IUserManager {
  create(user: IUser): Promise<IUser>;
  getAll(): Promise<IUser[]>;
  getById(id: string): Promise<IUser>;
}