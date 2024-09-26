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
import { LaunchCollectionManager } from "../../services/launch-collection.manager";
import { ILaunchCollection } from "../../interfaces/launch-collection/launch-collection.interface";

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
      // const collection: ICollection = req.body;

        //check if the collection name already exists then return error
        const existingLaunchCollection =
        await LaunchCollectionManager.getInstance().getByName(
          req.body.collectionName
        );

        if (!existingLaunchCollection) {
          return res.status(ResponseCode.SUCCESS).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.NOT_FOUND,
            description: ResponseDescription.NOT_FOUND,
            data: null,
          });

        }

        const existingCollection =
          await collectionManager.getByName(req.body.collectionName);
        if (existingCollection) {
          return res.status(ResponseCode.SUCCESS).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.CONFLICT,
            description: ResponseDescription.CONFLICT,
            data: null,
          });
        }



     
        //  const collection: ICollection = {
        //   user : existingLaunchCollection.user,
        //   applicationId : existingLaunchCollection._id,
        //   applicationType : req.body.applicationType,
        //   collectionName : existingLaunchCollection.collectionName,
        //   slug : existingLaunchCollection.collectionName.toLowerCase().replace(/ /g, "-"),
        //   tokenSymbol : "",
        //   collectionInfo : existingLaunchCollection.projectDescription,
        //   collectionUrl : "",
        //   category : existingLaunchCollection.projectCategory,
        //   imageUrl : existingLaunchCollection.collectionCoverImage,
        //   bannerUrl : existingLaunchCollection.collectionBannerImage,
        //   totalSupply : parseInt(existingLaunchCollection.totalSupply),
        //   mintPrice : parseFloat(existingLaunchCollection.mintPrice),
        //   isActive : false,
        //   tokenList : [],
        //   royaltyFee : parseFloat(existingLaunchCollection.royaltyPercentage),
        //   royaltyAddress : "",
        //   totalNftPrice : 0,
        //   totalNft : 0,
        //   minNftPrice : 0,
        //   maxNftPrice : 0,
        //   totalNftUser : 0,
        //   createdAt : new Date(),
        //   updatedAt : new Date(),
        // }
        const collection: ICollection = {
          user: existingLaunchCollection.user,
          applicationId: existingLaunchCollection._id,
          applicationType: req.body.applicationType,
          collectionName: existingLaunchCollection.collectionName,
          slug: existingLaunchCollection.collectionName.toLowerCase().replace(/ /g, "-"),
          tokenSymbol: "",
          collectionInfo: existingLaunchCollection.projectDescription,
          collectionUrl: "",
          category: existingLaunchCollection.projectCategory,
          imageUrl: existingLaunchCollection.collectionCoverImage,
          bannerUrl: existingLaunchCollection.collectionBannerImage,
          totalSupply: parseInt(existingLaunchCollection.totalSupply),
          mintPrice: parseFloat(existingLaunchCollection.mintPrice),
          isActive: false,
          tokenList: [],
          royaltyFee: parseFloat(existingLaunchCollection.royaltyPercentage),
          royaltyAddress: "",
          totalNftPrice: 0,
          totalNft: 0,
          minNftPrice: 0,
          maxNftPrice: 0,
          totalNftUser: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          collectionId: "", // Set to default, will need to be generated or assigned later
          size: "", // Default empty string
          maxSize: "", // Default empty string
          creator: existingLaunchCollection.creator || "", // If `creator` exists, else default to empty string
          creatorGuard: {}, // Default to empty object
          tokens: [], // Default to empty array
          firstTokenData: null, // Default to null
          lastUpdated: new Date(), // Default to current date
          collectionCoverImage: existingLaunchCollection.collectionCoverImage || "", // Default to empty string
          collectionBannerImage: existingLaunchCollection.collectionBannerImage || "", // Default to empty string
          reservePrice: 0, // Default to 0
        };
        

        console.log(collection, "collection");

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

  public async getByName(req: Request, res: Response) {
    try {
      const name: string = req.params.name;
      const collection: ICollection = await collectionManager.getByName(name);
      if (!collection) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.FAILED,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null,
        });
      }

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collectionResponseData(collection),
      });

      



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

  // getAllPaginationData
  // public async getAllPaginationData(req: Request, res: Response) {
  //   try {
  //     const { page, limit } = req.body;
  //     const collections: ICollection[] = await collectionManager.getAllPaginationData(
  //       page,
  //       limit
  //     );
  //     const responseData: IResponseHandler = {
  //       status: ResponseStatus.SUCCESS,
  //       message: ResponseMessage.SUCCESS,
  //       description: ResponseDescription.SUCCESS,
  //       data: collections.map((collection) =>
  //         collectionResponseData(collection)
  //       ),
  //     };
  //     return res.status(ResponseCode.SUCCESS).json(responseData);
  //   } catch (error) {
  //     const responseData: IResponseHandler = {
  //       status: ResponseStatus.FAILED,
  //       message: ResponseMessage.FAILED,
  //       description: ResponseDescription.FAILED,
  //       data: null,
  //     };
  //     return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
  //   }
  // }

  public async getAllPaginationData(req: Request, res: Response) {
    try {
      const page = parseInt(req.body.page as string) || 1;
      const limit = parseInt(req.body.limit as string) || 10;
      const search = req.body.search as string || '';
      const timeRange = req.body.timeRange as { value: string; text: string };
      console.log(timeRange, "timeRange",req.body);
      console.log(page, limit, "page, limit");
  
      const { data: collections, totalCount } = await collectionManager.getAllPaginationData(
        page,
        limit,
        search,
        timeRange
      );
  
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: {
          // collections: collections.map((collection: any) =>
          //   collectionResponseData(collection)
          // ),
          collections: collections,
          pagination: {
            currentPage: page,
            limit: limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        },
      };
  
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      console.error('Error in getAllPaginationData:', error);
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
