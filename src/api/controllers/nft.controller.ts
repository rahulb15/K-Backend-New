import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { INft, IBidInfo } from "../../interfaces/nft/nft.interface";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import nftManager from "../../services/nft.manager";
import { ILaunchCollection } from "../../interfaces/launch-collection/launch-collection.interface";
import { LaunchCollectionManager } from "../../services/launch-collection.manager";
import { INftActivity } from "../../interfaces/activity/activity.interface";
import NftActivity from "../../models/activity.model";
import mongoose from "mongoose";
import { isValidKadenaAddress } from "../../utils/addressValidator";
import { broadcastCollectionActivity } from "../../helpers/websocket-server";
import { activityResponseData } from "../../utils/userResponse/activity-response.utils";
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
      console.log(body);
      const collection: ILaunchCollection =
        await LaunchCollectionManager.getInstance().getByName(
          body.collectionName
        );

      const nfts: INft[] = [];
      for (let i = 0; i < body.reserveTknAmount; i++) {
        console.log("Iam here");
        const nft: INft = {
          user: req.user._id,
          collectionId: collection._id as any,
          collectionType: "Launchpad",
          collectionName: body.collectionName,
          creator: collection.creatorWallet || req.user.walletAddress,
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
          unlockable: false,
          digitalCode: "",
          duration: "",
          roylaities: "",
          tokenImage: "",
          nftPrice: 0,
          tokenId: "", // Make tokenId unique if needed
          owner: req.user.walletAddress,
        };
        nfts.push(nft);
      }

      console.log(nfts);

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
      console.log(error);
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  //   const body = {
  //     collectionName: uniqueCollectionName,
  //     nftPrice: data.nftPrice,
  //     unlockable: data.unlockable,
  //     creatorName: data.creatorName,
  //     duration: data.duration,
  //     isPlatform: true,
  //     uri: data.uri,
  //     policies: data.policies,
  //     royaltyAccount: data.royaltyAccount,
  //     royaltyPercentage: data.royaltyPercentage,
  // };
  public async createOne(req: any, res: Response) {
    try {
      const body: any = req.body;
      const nft: INft = {
        user: req.user._id,
        collectionType: "SingleNFT",
        collectionName: body.collectionName,
        creator: req.user.walletAddress,
        creatorName: body.creatorName,
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
        unlockable: false,
        digitalCode: "",
        duration: "",
        roylaities: "",
        tokenImage: "",
        nftPrice: 0,
        tokenId: "", // Make tokenId unique if needed
        policies: body.policies,
        uri: body.uri,
      };

      const createdNft: INft = await nftManager.create(nft);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: createdNft,
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

  // getByTokenId
  public async getByTokenId(req: Request, res: Response) {
    try {
      const tokenId: string = req.params.tokenId;
      const nft: INft = await nftManager.getByTokenId(tokenId);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: nft,
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      console.log(error);
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }
  

  public async onSale(req: any, res: Response) {
    try {
      const body: any = req.body;
      console.log(body);
      const updatedNft: INft = await nftManager.onSale(body);
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

  public async updateByAdmin(req: any, res: Response) {
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

      const updatedNft: INft = await nftManager.updateByAdmin(body);
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

  // updateLaunchapadByAdmin
  public async updateLaunchapadByAdmin(req: any, res: Response) {
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

      const updatedNft: INft = await nftManager.updateLaunchapadByAdmin(body);
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
      const userId = req.user._id;
      console.log(body, "ddddddddddddddddddddddddddddddd");
      const updatedNft: INft = await nftManager.updateRevealedNFTs(
        body,
        userId
      );
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
      const ipfsHash: string =
        "ipfs://bafkreicm7uen4kb3y7nwoexrsx7sre6ckfmtbfufslidbesfsbzfi2lguy";
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

  // // getMarketPlaceNfts
  // public async getMarketPlaceNfts(req: any, res: Response) {
  //   try {
  //     const pageNo: number = parseInt(req.query.pageNo as string);
  //     const limit: number = parseInt(req.query.limit as string);
  //     const search: string = req.query.search as string;
  //     console.log(pageNo, limit, search);

  //     const nfts: any = await nftManager.getMarketPlaceNfts( pageNo, limit, search);

  //     const responseData: IResponseHandler = {
  //       status: ResponseStatus.SUCCESS,
  //       message: ResponseMessage.SUCCESS,
  //       description: ResponseDescription.SUCCESS,
  //       data: nfts,
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

  public async getMarketPlaceNfts(req: any, res: Response) {
    try {
      const pageNo: number = parseInt(req.query.pageNo as string);
      const limit: number = parseInt(req.query.limit as string);
      const search: string = req.query.search as string;
      const onSale: boolean = req.body.onSale === true;
      const onAuction: boolean = req.body.onAuction === true;
      console.log(pageNo, limit, search, onSale, onAuction);

      const nfts: any = await nftManager.getMarketPlaceNfts(
        pageNo,
        limit,
        search,
        onSale,
        onAuction
      );

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

  public async getCollectionNfts(req: any, res: Response) {
    try {
      const pageNo: number = parseInt(req.query.pageNo as string);
      const limit: number = parseInt(req.query.limit as string);
      const search: string = req.query.search as string;
      console.log(pageNo, limit, search);
      const collectionName: string = req.body.collectionName;
      console.log(
        collectionName,
        "dddddddddddddddddddddddddddddddddddddddddddddd"
      );

      const nfts: any = await nftManager.getCollectionNfts(
        pageNo,
        limit,
        search,
        collectionName
      );

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

  public async getCollectionNftsMarket(req: any, res: Response) {
    try {
      const pageNo: number = parseInt(req.query.pageNo as string);
      const limit: number = parseInt(req.query.limit as string);
      const search: string = req.query.search as string;
      console.log(pageNo, limit, search);
      const collectionName: string = req.body.collectionName;
      console.log(
        collectionName,
        "dddddddddddddddddddddddddddddddddddddddddddddd"
      );

      const nfts: any = await nftManager.getCollectionNftsMarket(
        pageNo,
        limit,
        search,
        collectionName
      );

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

  // getOwnedNfts page limit search
  public async getOwnedNfts(req: any, res: Response) {
    try {
      const userId = req.user._id;
      const pageNo: number = parseInt(req.body.pageNo as string);
      const limit: number = parseInt(req.body.limit as string);
      const search: string = req.body.search as string;
      console.log(pageNo, limit, search);

      const nfts: any = await nftManager.getOwnedNfts(
        userId,
        pageNo,
        limit,
        search
      );

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

  // getOwnedPriorityPassNfts
  public async getOwnedPriorityPassNfts(req: any, res: Response) {
    try {
      const userId = req.user._id;
      const pageNo: number = parseInt(req.body.pageNo as string);
      const limit: number = parseInt(req.body.limit as string);
      const search: string = req.body.search as string;
      console.log(pageNo, limit, search);

      const nfts: any = await nftManager.getOwnedPriorityPassNfts(
        userId,
        pageNo,
        limit,
        search
      );

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





  public async getOwnSaleNfts(req: any, res: Response) {
    try {
      const userId = req.user._id;
      const pageNo: number = parseInt(req.query.pageNo as string);
      const limit: number = parseInt(req.query.limit as string);
      const search: string = req.query.search as string;
      console.log(pageNo, limit, search);

      const nfts: any = await nftManager.getOwnSaleNfts(
        userId,
        pageNo,
        limit,
        search
      );

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

  public async getOwnAuctionNfts(req: any, res: Response) {
    try {
      const userId = req.user._id;
      const pageNo: number = parseInt(req.query.pageNo as string);
      const limit: number = parseInt(req.query.limit as string);
      const search: string = req.query.search as string;
      console.log(pageNo, limit, search);

      const nfts: any = await nftManager.getOwnAuctionNfts(
        userId,
        pageNo,
        limit,
        search
      );

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



  public async getOwnDutchAuctionNfts(req: any, res: Response) {
    try {
      const userId = req.user._id;
      const pageNo: number = parseInt(req.query.pageNo as string);
      const limit: number = parseInt(req.query.limit as string);
      const search: string = req.query.search as string;
      console.log(pageNo, limit, search);

      const nfts: any = await nftManager.getOwnDutchAuctionNfts(
        userId,
        pageNo,
        limit,
        search
      );

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





  // public async placeBid(req: any, res: Response): Promise<void> {
  //   try {
  //     const { nftId, bidAmount } = req.body;
  //     const userId = req.user._id; // Assuming you have user information in the request after authentication

  //     console.log(nftId, bidAmount, userId);

  //     if (!mongoose.Types.ObjectId.isValid(nftId)) {
  //       res.status(400).json({ message: "Invalid NFT ID" });
  //       return;
  //     }

  //     if (typeof bidAmount !== "number" || bidAmount <= 0) {
  //       res.status(400).json({ message: "Invalid bid amount" });
  //       return;
  //     }

  //     // 1. Validate the bid (e.g., check if the NFT exists, if it's on auction, if the bid amount is valid)
  //     const nft = await nftManager.getNftById(nftId);
  //     if (!nft) {
  //       res.status(404).json({ message: "NFT not found" });
  //       return;
  //     }

  //     if (!nft.onAuction) {
  //       res.status(400).json({ message: "This NFT is not on auction" });
  //       return;
  //     }

  //     // Add more validation as needed (e.g., check if bid amount is higher than current highest bid)
  //     const highestBid = nft.bidInfo.reduce(
  //       (max, bid) => (bid.amount > max ? bid.amount : max),
  //       0
  //     );
  //     if (bidAmount <= highestBid) {
  //       res
  //         .status(400)
  //         .json({
  //           message: "Bid amount must be higher than the current highest bid",
  //         });
  //       return;
  //     }

  //     // 2. Process the bid (this would typically involve interacting with a smart contract)
  //     const newBid: IBidInfo = {
  //       userId: userId,
  //       amount: bidAmount,
  //       timestamp: new Date(),
  //     };
  //     nft.bidInfo.push(newBid);
  //     await nftManager.updateNft(nft);

  //     // 3. Record the bid activity
  //     const activity = new NftActivity({
  //       nft: nftId,
  //       collectionId: nft.collectionId,
  //       activityType: "bid",
  //       fromUser: userId,
  //       price: bidAmount,
  //       currency: "KDA", // Assuming KDA is the default currency
  //       timestamp: new Date(),
  //     });
  //     await activity.save();

  //     const responseData: IResponseHandler = {
  //       status: ResponseStatus.SUCCESS,
  //       message: ResponseMessage.SUCCESS,
  //       description: ResponseDescription.SUCCESS,
  //       data: nft,
  //     };
  //     res.status(ResponseCode.SUCCESS).json(responseData);
  //   } catch (error) {
  //     console.error("Error placing bid:", error);
  //     const responseData: IResponseHandler = {
  //       status: ResponseStatus.FAILED,
  //       message: ResponseMessage.FAILED,
  //       description: ResponseDescription.FAILED,
  //       data: null,
  //     };
  //     res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
  //   }
  // }


  // public async buyNft(req: any, res: Response): Promise<void> {
  //   try {
  //     const { nftId } = req.body;
  //     const buyerId = req.user._id; // Assuming you have user information in the request after authentication

  //     if (!mongoose.Types.ObjectId.isValid(nftId)) {
  //       res.status(400).json({ message: "Invalid NFT ID" });
  //       return;
  //     }

  //     // 1. Validate the purchase (e.g., check if the NFT exists, if it's on sale)
  //     const nft = await nftManager.getNftById(nftId);
  //     if (!nft) {
  //       res.status(404).json({ message: "NFT not found" });
  //       return;
  //     }

  //     if (!nft.onSale) {
  //       res.status(400).json({ message: "This NFT is not for sale" });
  //       return;
  //     }

  //     // 2. Process the purchase (this would typically involve interacting with a smart contract)
  //     const oldOwnerId = nft.user || null;
  //     nft.user = buyerId;
  //     nft.onSale = false;
  //     nft.onMarketplace = false;

  //     // 3. Update the NFT ownership
  //     const updatedNft = await nftManager.updateNft(nft);

  //     if (!updatedNft) {
  //       res.status(500).json({ message: "Failed to update NFT ownership" });
  //       return;
  //     }

  //     // 4. Record the purchase activity as a transfer
  //     const activity = new NftActivity({
  //       nft: nftId,
  //       collectionId: nft.collectionId,
  //       activityType: "transfer", // Changed from "sale" to "transfer"
  //       fromUser: oldOwnerId,
  //       toUser: buyerId,
  //       price: nft.nftPrice,
  //       currency: "KDA", // Assuming KDA is the default currency
  //       timestamp: new Date()
  //     });
  //     await activity.save();

  //     const responseData: IResponseHandler = {
  //       status: ResponseStatus.SUCCESS,
  //       message: ResponseMessage.SUCCESS,
  //       description: ResponseDescription.SUCCESS,
  //       data: updatedNft,
  //     };
  //     res.status(ResponseCode.SUCCESS).json(responseData);

  //   } catch (error) {
  //     console.error("Error buying NFT:", error);
  //     const responseData: IResponseHandler = {
  //       status: ResponseStatus.FAILED,
  //       message: ResponseMessage.FAILED,
  //       description: ResponseDescription.FAILED,
  //       data: null,
  //     };
  //     res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
  //   }
  // }


  public async placeBid(req: any, res: Response): Promise<void> {
    try {
      const { nftId, bidAmount, bidderAddress } = req.body;

      console.log(nftId, bidAmount, bidderAddress);

      if (!mongoose.Types.ObjectId.isValid(nftId)) {
        res.status(400).json({ message: "Invalid NFT ID" });
        return;
      }

      if (typeof bidAmount !== "number" || bidAmount <= 0) {
        res.status(400).json({ message: "Invalid bid amount" });
        return;
      }

      if (!isValidKadenaAddress(bidderAddress)) {
        res.status(400).json({ message: "Invalid Kadena address" });
        return;
      }

      // 1. Validate the bid (e.g., check if the NFT exists, if it's on auction, if the bid amount is valid)
      const nft = await nftManager.getNftById(nftId);
      if (!nft) {
        res.status(404).json({ message: "NFT not found" });
        return;
      }

      if (!nft.onAuction) {
        res.status(400).json({ message: "This NFT is not on auction" });
        return;
      }

      // Add more validation as needed (e.g., check if bid amount is higher than current highest bid)
      const highestBid = nft.bidInfo.reduce(
        (max, bid) => (bid.amount > max ? bid.amount : max),
        0
      );
      if (bidAmount <= highestBid) {
        res.status(400).json({
          message: "Bid amount must be higher than the current highest bid",
        });
        return;
      }

      // 2. Process the bid (this would typically involve interacting with a smart contract)
      const newBid: IBidInfo = {
        bidderAddress: bidderAddress,
        amount: bidAmount,
        timestamp: new Date(),
      };
      nft.bidInfo.push(newBid);
      await nftManager.updateNft(nft);

      // 3. Record the bid activity
      const activity = new NftActivity({
        nft: nftId,
        collectionId: nft.collectionId,
        activityType: "bid",
        fromAddress: bidderAddress,
        toAddress: nft.owner, // The current owner's address
        price: bidAmount,
        currency: "KDA", // Assuming KDA is the default currency
        timestamp: new Date(),
      });
      await activity.save();

      broadcastCollectionActivity(activity.collectionId.toString(), activityResponseData(activity));


      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: nft,
      };
      res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      console.error("Error placing bid:", error);
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async buyNft(req: Request, res: Response): Promise<void> {
    try {
      const { nftId, buyerWalletAddress } = req.body;

      if (!mongoose.Types.ObjectId.isValid(nftId)) {
        res.status(400).json({ message: "Invalid NFT ID" });
        return;
      }

      if (!isValidKadenaAddress(buyerWalletAddress)) {
        res.status(400).json({ message: "Invalid buyer Kadena address" });
        return;
      }

      // 1. Validate the purchase (e.g., check if the NFT exists, if it's on sale)
      const nft:any = await nftManager.getNftById(nftId);
      if (!nft) {
        res.status(404).json({ message: "NFT not found" });
        return;
      }

      if (!nft.onSale) {
        res.status(400).json({ message: "This NFT is not for sale" });
        return;
      }

      const oldOwnerAddress = nft.owner;

      // 2. Process the purchase (this would typically involve interacting with a smart contract)
      nft.owner = buyerWalletAddress;
      nft.onSale = false;
      nft.onMarketplace = false;

      // 3. Update the NFT ownership
      const updatedNft = await nftManager.updateNft(nft);

      if (!updatedNft) {
        res.status(500).json({ message: "Failed to update NFT ownership" });
        return;
      }

      // 4. Record the purchase activity as a transfer
      const activity = new NftActivity({
        nft: nftId,
        collectionId: nft.collectionId,
        activityType: "transfer",
        fromAddress: oldOwnerAddress,
        toAddress: buyerWalletAddress,
        price: nft.nftPrice,
        currency: "KDA",
        timestamp: new Date()
      });

      // Validate the activity document before saving
      const validationError = activity.validateSync();
      if (validationError) {
        console.error("Validation error:", validationError);
        res.status(400).json({ message: "Invalid activity data", errors: validationError.errors });
        return;
      }

      await activity.save();

      broadcastCollectionActivity(activity.collectionId.toString(), activityResponseData(activity));


      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: updatedNft,
      };
      res.status(ResponseCode.SUCCESS).json(responseData);


   
    } catch (error) {
      console.error("Error buying NFT:", error);
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        // res.status(400).json({ message: "Validation error", errors: validationErrors });

        const responseData: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: validationErrors,
        };
        res.status(ResponseCode.BAD_REQUEST).json(responseData);

      } else if (error instanceof mongoose.Error) {
        // res.status(500).json({ message: "Database error", error: error.message });
        const responseData: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: error.message,
        };
        res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
      } else {
        // res.status(500).json({ message: "An unexpected error occurred while buying the NFT" });
        const responseData: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: "An unexpected error occurred while buying the NFT",
        };
        res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
      }
    }
  }


  // getPriorityPassNfts
  public async getPriorityPassNfts(req: any, res: Response) {
    try {
      const pageNo: number = parseInt(req.body.pageNo as string);
      const limit: number = parseInt(req.body.limit as string);
      const search: string = req.body.search as string;
      console.log(pageNo, limit, search);

      const nfts: any = await nftManager.getPriorityPassNfts(
        pageNo,
        limit,
        search
      );

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

  // getPriorityPassNftsTokenIdEmpty
  public async getPriorityPassNftsTokenIdEmpty(req: any, res: Response) {
    try {
      const pageNo: number = parseInt(req.body.pageNo as string);
      const limit: number = parseInt(req.body.limit as string);
      const search: string = req.body.search as string;
      console.log(pageNo, limit, search);

      const nfts: any = await nftManager.getPriorityPassNftsTokenIdEmpty(
        pageNo,
        limit,
        search
      );

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
        data: error,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }
public async getRandomUris(req: any, res: Response) {
    try {
      const body: any = req.body;
      const nfts: any = await nftManager.getRandomUris(body);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: nfts,
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    }
    catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: error,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async updateNFTWithRandomUri(req: any, res: Response) {
    try {
      const body: any = req.body;
      const nfts: any = await nftManager.updateNFTWithRandomUri(body);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: nfts,
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    }
    catch (error) {
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

export default NftController.getInstance();
