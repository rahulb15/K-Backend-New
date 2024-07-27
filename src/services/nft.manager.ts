import { INft } from "../interfaces/nft/nft.interface";
import { INftManager } from "../interfaces/nft/nft.manager.interface";
import Nft from "../models/nft.model";
import mongoose from "mongoose";

export class NftManager implements INftManager {
  private static instance: NftManager;

  // private constructor() {}

  public static getInstance(): NftManager {
    if (!NftManager.instance) {
      NftManager.instance = new NftManager();
    }

    return NftManager.instance;
  }

  public async create(nft: INft): Promise<INft> {
    const newNft = new Nft(nft);
    return newNft.save();
  }

  // const nfts: INft[] = await nftManager.getAll(userId, pageNo, limit, search);

  public async getAll(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[], total: number, currentPage: number }> {

       // First, get the total count of matching documents
       const total = await Nft.countDocuments({
        user: new mongoose.Types.ObjectId(userId),
        collectionName: { $regex: search, $options: "i" },
      });



    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          user: userId,
          collectionName: { $regex: search, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: "$user.username",
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          likes: 1,
          createdAt: 1 // Add createdAt here
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);
  
    return {
      nfts,
      total,
      currentPage: pageNo
    };
  }

 
  

  public async getById(id: string): Promise<INft> {
    const nft: INft = (await Nft.findById(id)) as INft;
    return nft;
  }
}

export default NftManager.getInstance();
