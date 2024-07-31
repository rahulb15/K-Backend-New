import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { INft } from "../../interfaces/nft/nft.interface";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import nftManager from "../../services/nft.manager";
import { ILaunchCollection } from "../../interfaces/launch-collection/launch-collection.interface";
import { LaunchCollectionManager } from "../../services/launch-collection.manager";

export class NftController {
  private static instance: NftController;

  // private constructor() {}

  public static getInstance(): NftController {
    if (!NftController.instance) {
      NftController.instance = new NftController();
    }

    return NftController.instance;
  }

  // _id?: string;
  // user: string;
  // collectionId: string;
  // collectionType: string;
  // collectionName: string;
  // creator: string;
  // tokenImage: string;
  // tokenId: string;
  // nftPrice: number;
  // unlockable: boolean;
  // isRevealed: boolean;
  // digitalCode: string;
  // onMarketplace: boolean;
  // onSale: boolean;
  // bidInfo: string[];
  // onAuction: boolean;
  // sellingType: string;
  // creatorName: string;
  // duration: string;
  // roylaities: string;
  // properties: string[];
  // likes: number;

  // public async create(req: any, res: Response) {
  //   try {

  //     // const data = {
  //     //   collectionName: syncColName,
  //     //   tokenId: response.data.result.data[0],
  //     //   wallet: user?.walletName,
  //     // };
  //     const body: any = req.body;
  //     const collection: ILaunchCollection = await LaunchCollectionManager.getInstance().getByName(body.collectionName);

  //     const nft: INft = {
  //       user: req.user._id,
  //       collectionId: collection._id as any,
  //       collectionType: "Launchpad",
  //       collectionName: body.collectionName,
  //       creator: req.user._id,
  //       creatorName: req.user.name,
  //       onMarketplace: false,
  //       onSale: false,
  //       onAuction: false,
  //       sellingType: "All",
  //       likes: 0,
  //       properties: [],
  //       bidInfo: [],
  //       isRevealed: false,
  //       unlockable: false,
  //       digitalCode: "",
  //       duration: "",
  //       roylaities: "",
  //       tokenImage: "",
  //       nftPrice: 0,
  //       tokenId: "",
  //     }

  //     const newNft: INft = await nftManager.create(nft);
  //     const responseData: IResponseHandler = {
  //       status: ResponseStatus.SUCCESS,
  //       message: ResponseMessage.CREATED,
  //       description: ResponseDescription.CREATED,
  //       data: newNft,
  //     };
  //     return res.status(ResponseCode.CREATED).json(responseData);
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

  public async create(req: any, res: Response) {
    try {
      const body: any = req.body;
      const collection: ILaunchCollection =
        await LaunchCollectionManager.getInstance().getByName(
          body.collectionName
        );

      const nfts: INft[] = [];
      for (let i = 0; i < body.reserveTknAmount; i++) {
        const nft: INft = {
          user: req.user._id,
          collectionId: collection._id as any,
          collectionType: "Launchpad",
          collectionName: body.collectionName,
          creator: req.user._id,
          creatorName: req.user.name,
          onMarketplace: false,
          onSale: false,
          onAuction: false,
          sellingType: "All",
          likes: 0,
          properties: [],
          bidInfo: [],
          isRevealed: false,
          unlockable: false,
          digitalCode: "",
          duration: "",
          roylaities: "",
          tokenImage: "",
          nftPrice: 0,
          tokenId: "", // Make tokenId unique if needed
        };
        nfts.push(nft);
      }

      const createdNfts: INft[] = await Promise.all(
        nfts.map((nft) => nftManager.create(nft))
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: createdNfts,
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
      console.log(userId);
      const pageNo: number = parseInt(req.query.pageNo as string);
      const limit: number = parseInt(req.query.limit as string);
      const search: string = req.query.search as string;

      // ): Promise<{ nfts: INft[], total: number, currentPage: number }> {

      // const nfts: INft[] = await nftManager.getAll(userId, pageNo, limit, search);
      const nfts: any = await nftManager.getAll(userId, pageNo, limit, search);

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
      const nft: INft = await nftManager.getById(nftId);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: nft,
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
      console.log(body);
      // {
      //   collectionName: 'monkeyaz9',
      //   tokenId: [
      //     't:6wb9Iw3tS7LDFXq1aOqMJ7L5kBSa58EdnfQG0Dps8Wk',
      //     't:rrh0qZKVH23Vh3iWPINRo8Jcgp_7ChWgGK1mdhMgbVk'
      //   ],
      //   wallet: 'k:d1d47937b0ec42efa859048d0fb5f51707639ddad991e58ae9efcff5f4ff9dbe'
      // }

      const updatedNft: INft = await nftManager.update(body);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.UPDATED,
        description: ResponseDescription.UPDATED,
        data: updatedNft,
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

  // updateRevealedNFTs
  public async updateRevealedNFTs(req: any, res: Response) {
    try {
      const body: any = req.body;
      console.log(body,"ddddddddddddddddddddddddddddddd");
      const updatedNft: INft = await nftManager.updateRevealedNFTs(body);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.UPDATED,
        description: ResponseDescription.UPDATED,
        data: updatedNft,
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







  public async getIpfsJson(req: Request, res: Response) {
    try {
      const ipfsHash: string = 'ipfs://bafkreicm7uen4kb3y7nwoexrsx7sre6ckfmtbfufslidbesfsbzfi2lguy';
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: null,
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

export default NftController.getInstance();
