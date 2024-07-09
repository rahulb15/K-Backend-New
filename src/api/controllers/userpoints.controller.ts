import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { IUserPoints } from "../../interfaces/userpoints/userpoints.interface";
import { UserPointsManager } from "../../services/userpoints.manager";
import { userPointsResponseData } from "../../utils/userResponse/userpoints-response.utils";

export class UserPointsController {
  private static instance: UserPointsController;

  // private constructor() {}

  public static getInstance(): UserPointsController {
    if (!UserPointsController.instance) {
      UserPointsController.instance = new UserPointsController();
    }

    return UserPointsController.instance;
  }

  public async create(req: any, res: Response) {
    try {
      const { userId, activityLog } = req.body;
      console.log(userId);
      const userPoints: IUserPoints =
        await UserPointsManager.getInstance().create({
          userId,
          activityLog,
          totalPoints: 0,
          ranking: 0,
          priorityPass: false,
        });

      console.log(userPoints);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: userPointsResponseData(userPoints),
      };
      return res.status(ResponseCode.CREATED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async getAll(req: Request, res: Response) {
    try {
      const userPoints: IUserPoints[] =
        await UserPointsManager.getInstance().getAll();
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: userPoints.map((userPoint) => userPointsResponseData(userPoint)),
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userPoints: IUserPoints =
        await UserPointsManager.getInstance().getByUserId(userId);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: userPointsResponseData(userPoints),
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }
}

export default UserPointsController.getInstance();
