import { IUser } from "../interfaces/user/user.interface";
import { IUserManager } from "../interfaces/user/user.manager.interface";
import User from "../models/user.model";

export class UserManager implements IUserManager {
  private static instance: UserManager;

  // private constructor() {}

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }

    return UserManager.instance;
  }

  public async getByEmail(email: string): Promise<IUser> {
    const user: IUser = (await User.findOne({ email: email })) as IUser;
    return user;
  }

  public async create(user: IUser): Promise<IUser> {
    const newUser = new User(user);
    return newUser.save();
  }

  public async getAll(): Promise<IUser[]> {
    return User.find();
  }

  public async getById(id: string): Promise<IUser> {
    const user: IUser = (await User.findById(id)) as IUser;
    return user;
  }

  public async updateById(id: string, user: IUser): Promise<IUser> {
    const newUser: IUser = (await User.findByIdAndUpdate(id, user, {
      new: true,
    })) as IUser;
    return newUser;
  }

  public async deleteById(id: string): Promise<IUser> {
    const user: IUser = (await User.findByIdAndDelete(id)) as IUser;
    return user;
  }

  public async getByWalletAddress(walletAddress: string): Promise<IUser> {
    const user: IUser = (await User.findOne({
      walletAddress: walletAddress,
    })) as IUser;
    console.log(user);
    return user;
  }

  public async update(id: string, user: IUser): Promise<IUser> {
    const newUser: IUser = (await User.findByIdAndUpdate(id, user, {
      new: true,
    })) as IUser;
    return newUser;
  }

  public async getAllUsersWithPagination(
    page: number,
    limit: number,
    search: string
  ): Promise<IUser[]> {
    const users: IUser[] = await User.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);
    return users;
  }

  //getTotalUsers by number only user role
  public async getTotalUsers(): Promise<number> {
    const users: number = await User.countDocuments({
      role: "user",
    });
    return users;
  }
}

export default UserManager.getInstance();
