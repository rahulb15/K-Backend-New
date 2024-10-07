import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import singleNftManager from "../../services/singleNft.manager";
import { ISingleNft } from "../../interfaces/singleNft/singleNft.interface";

export class SingleNftController {
  private static instance: SingleNftController;

  // private constructor() {}

  public static getInstance(): SingleNftController {
    if (!SingleNftController.instance) {
      SingleNftController.instance = new SingleNftController();
    }

    return SingleNftController.instance;
  }

  public async create(req: any, res: Response) {
    try {
      const body: any = req.body;
        const singleNft: ISingleNft = {
          user: req.user._id,
          nftName: body.nftName,
          creator: req.user.walletAddress,
          creatorName: req.user.name,
          onMarketplace: false,
          onSale: false,
          onAuction: false,
          onDutchAuction: false,
          sellingType: "All",
          likes: 0,
          properties: [],
          attributes: [],
          bidInfo: [],
          isRevealed: false,
          isMinted: false,
          unlockable: false,
          digitalCode: "",
          duration: "",
          tokenImage: body.tokenImage,
          nftPrice: body.nftPrice,
          tokenId: "",
          policies: body.policies,
          uri: body.uri,
          royaltyAccount: body.royaltyAccount,
          royaltyPercentage: body.royaltyPercentage,
        };
        const createdSingleNft: ISingleNft = await singleNftManager.create(singleNft);
        const responseData: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.CREATED,
          description: ResponseDescription.CREATED,
          data: createdSingleNft,
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

  public async getAll(req: any, res: Response) {
    try {
      // OPTIONS /api/v1/nft?pageNo=1&limit=10&search= 204 0.166 ms - 0
      const userId = req.user._id;
      const pageNo: number = parseInt(req.body.pageNo as string);
      const limit: number = parseInt(req.body.limit as string);
      const search: string = req.body.search as string;


      const nfts: any = await singleNftManager.getAll(userId, pageNo, limit, search);

      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: nfts,
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


  public async getAllMarketPlace(req: any, res: Response) {
    try {
      // OPTIONS /api/v1/nft?pageNo=1&limit=10&search= 204 0.166 ms - 0
      const userId = req?.user?._id || "";
      console.log(userId, "userId");
      const pageNo: number = parseInt(req.body.pageNo as string);
      const limit: number = parseInt(req.body.limit as string);
      const search: string = req.body.search as string;


      const nfts: any = await singleNftManager.getAllMarketPlace(userId, pageNo, limit, search);

      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: nfts,
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
      const nftId: string = req.params.id;
        const singleNft: ISingleNft = await singleNftManager.getById(nftId);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: singleNft,
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

  // update
  public async update(req: any, res: Response) {
    try {
      const body: any = req.body;
      console.log(body, "body");
      const singleNft: any = {
        _id: body._id,
        isMinted: body.isMinted,
       
      };
      console.log(singleNft, "singleNft");
      const updatedSingleNft: ISingleNft = await singleNftManager.update(singleNft);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: updatedSingleNft,
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

  public async getTopCreators(req: Request, res: Response) {
    try {
      const { timeFrame = req.body.timeFrame, limit = 10, page = 1 } = req.query;
      
      const topCreators = await singleNftManager.getTopCreators(timeFrame as string, Number(limit), Number(page));

      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: topCreators,
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: error,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

}

export default SingleNftController.getInstance();
