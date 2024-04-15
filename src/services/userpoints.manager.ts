import mongoose from 'mongoose';
import { IUserPointsManager } from '../interfaces/userpoints/userpoints.manager.interface';
import { IUserPoints } from '../interfaces/userpoints/userpoints.interface';
import UserPoints from '../models/userpoints.model';


export class UserPointsManager implements IUserPointsManager {
    private static instance: UserPointsManager;

    // private constructor() {}

    public static getInstance(): UserPointsManager {
      if (!UserPointsManager.instance) {
        UserPointsManager.instance = new UserPointsManager();
      }

      return UserPointsManager.instance;
    }

    public async create(userPoints: IUserPoints): Promise<IUserPoints> {
        const newUserPoints = new UserPoints(userPoints);
        return newUserPoints.save();
    }

    public async getAll(): Promise<IUserPoints[]> {
        return UserPoints.find();
    }

    public async getByUserId(userId: string): Promise<IUserPoints> {
        const userPoints = await UserPoints.findOne({ userId });
        if (!userPoints) {
            throw new Error('UserPoints not found');
        }
        return userPoints;
    }
}
