import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { Request, Response } from "express";
import { LaunchCollectionManager } from "../../services/launch-collection.manager";
import { ILaunchCollection } from "../../interfaces/launch-collection/launch-collection.interface";
import { launchCollectionResponseData } from "../../utils/userResponse/launch-collection-response.utils";
import mongoose from "mongoose";

export class LaunchCollectionController {
  private static instance: LaunchCollectionController;

  public static getInstance(): LaunchCollectionController {
    if (!LaunchCollectionController.instance) {
      LaunchCollectionController.instance = new LaunchCollectionController();
    }

    return LaunchCollectionController.instance;
  }

  public async create(req: any, res: Response): Promise<Response> {
    try {
      const collection: ILaunchCollection = req.body;
      collection.user = req.user._id;


      //check if the collection name already exists then return error
      const existingCollection = await LaunchCollectionManager.getInstance().getByName(collection.collectionName);
      console.log("🚀 ~ LaunchCollectionController ~ create ~ existingCollection", existingCollection);
      if (existingCollection) {
        return res.status(ResponseCode.SUCCESS).json({
          status: ResponseStatus.FAILED,
          message: ResponseMessage.CONFLICT,
          description: ResponseDescription.CONFLICT,
          data: null,
        });
      }


      const newCollection = await LaunchCollectionManager.getInstance().create(
        collection
      );
      return res.status(ResponseCode.CREATED).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: launchCollectionResponseData(newCollection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async update(req: any, res: Response): Promise<Response> {
    try {
      const collectionName = req.params.collectionName;
      const collection: ILaunchCollection = req.body;
      collection.user = req.user._id;
      const updatedCollection =
        await LaunchCollectionManager.getInstance().update(
          collectionName,
          collection
        );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(updatedCollection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async getByUserId(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;
      const collection =
        await LaunchCollectionManager.getInstance().getByUserId(userId);
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(collection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  //get all collections with pagination search and filter
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search } = req.query;
      console.log("🚀 ~ LaunchCollectionController ~ getAll ~ page:", page);
      const collections = await LaunchCollectionManager.getInstance().getAll(
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async approve(req: any, res: Response): Promise<Response> {
    try {
      console.log("🚀 ~ LaunchCollectionController ~ approve ~ req", req.params);
      const id = req.params.id;
      const updatedCollection: ILaunchCollection =
        await LaunchCollectionManager.getInstance().approve(id) as ILaunchCollection;
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(updatedCollection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async reject(req: any, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const updatedCollection: ILaunchCollection =
        await LaunchCollectionManager.getInstance().reject(id) as ILaunchCollection;
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(updatedCollection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }



}

export default LaunchCollectionController.getInstance();
