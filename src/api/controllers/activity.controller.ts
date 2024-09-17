import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { INftActivity } from "../../interfaces/activity/activity.interface";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import activityManager from "../../services/activity.service";
import { activityResponseData } from "../../utils/userResponse/activity-response.utils";
import { producer } from "../../config/kafka.config";
import { broadcastCollectionActivity } from "../../helpers/websocket-server";
import RealTimeActivityService from "../../services/real-time-activity.service";

export class ActivityController {
  private static instance: ActivityController;

  // private constructor() {}

  public static getInstance(): ActivityController {
    if (!ActivityController.instance) {
      ActivityController.instance = new ActivityController();
    }

    return ActivityController.instance;
  }

  public async create(req: any, res: Response) {
    try {
      const activity: INftActivity = req.body;
      const newActivity: INftActivity = await activityManager.create(activity);
      // Publish the new activity to Kafka
      await producer.send({
        topic: "nft-activities",
        messages: [
          {
            key: newActivity.collectionId.toString(),
            value: JSON.stringify(activityResponseData(newActivity)),
          },
        ],
      });

      // // Broadcast the new activity to connected clients
      // broadcastCollectionActivity(
      //   newActivity.collectionId.toString(),
      //   activityResponseData(newActivity)
      // );

      RealTimeActivityService.broadcastActivity(
        newActivity.collectionId.toString(),
        activityResponseData(newActivity)
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: activityResponseData(newActivity),
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
      const activities: INftActivity[] = await activityManager.getAll();
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: activities.map((activity) => activityResponseData(activity)),
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

  public async getById(req: Request, res: Response) {
    try {
      const activity: INftActivity = await activityManager.getById(
        req.params.id
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: activityResponseData(activity),
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
  public async update(req: Request, res: Response) {
    try {
      const activity: INftActivity = req.body;
      const updatedActivity: INftActivity = await activityManager.update(
        new mongoose.Types.ObjectId(req.params.id),
        activity
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.UPDATED,
        description: ResponseDescription.UPDATED,
        data: activityResponseData(updatedActivity),
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

  public async getCandleData(req: Request, res: Response) {
    try {
      const { collectionId, interval } = req.body;
      const candleData = await activityManager.getCandleData(
        collectionId as string,
        interval as string
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: candleData,
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error: any) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: error.message,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }
}
export default ActivityController;
