import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { ICollection } from "../../interfaces/collection/collection.interface";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import collectionManager from "../../services/collection.manager";
import { collectionResponseData } from "../../utils/userResponse/collection-response.utils";

export class CollectionController {
  private static instance: CollectionController;

  // private constructor() {}

  public static getInstance(): CollectionController {
    if (!CollectionController.instance) {
      CollectionController.instance = new CollectionController();
    }

    return CollectionController.instance;
  }

  public async create(req: any, res: Response) {
    try {
      console.log(req.user, "user");
      const collection: ICollection = req.body;
      collection.user = req.user._id;
      const newCollection: ICollection = await collectionManager.create(
        collection
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: collectionResponseData(newCollection),
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
      const collections: ICollection[] = await collectionManager.getAll();
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections.map((collection) =>
          collectionResponseData(collection)
        ),
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
      const id: string = req.params.id;
      const collection: ICollection = await collectionManager.getById(id);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collectionResponseData(collection),
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
export default CollectionController.getInstance();
