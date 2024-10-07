import { ISingleNft } from "../interfaces/singleNft/singleNft.interface";
import { ISingleNftManager } from "../interfaces/singleNft/singleNft.manager.interface";
import SingleNft from "../models/singleNft.model";
import mongoose from "mongoose";

export class SingleNftManager implements ISingleNftManager {
  private static instance: SingleNftManager;

  // private constructor() {}

  public static getInstance(): SingleNftManager {
    if (!SingleNftManager.instance) {
      SingleNftManager.instance = new SingleNftManager();
    }

    return SingleNftManager.instance;
  }

  public async create(nft: ISingleNft): Promise<ISingleNft> {
    const newSingleNft = new SingleNft(nft);
    return await newSingleNft.save();
  }

  // const nfts: INft[] = await nftManager.getAll(userId, pageNo, limit, search);

  public async getAll(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ singleNfts: ISingleNft[]; total: number; }> {
    //find all if userId matches and search also matches
    const query = {
      // user: new mongoose.Types.ObjectId(userId),
      nftName: { $regex: search, $options: "i" },
    };

    const total = await SingleNft.find(query).countDocuments();
    const singleNfts = await SingleNft.find(query)
      .skip((pageNo - 1) * limit)
      .limit(limit)
      .sort({ lastUpdated: -1 });

    return { singleNfts, total };
  }

  public async getById(id: string): Promise<ISingleNft> {
    const singleNft: ISingleNft = (await SingleNft.findById(id)) as ISingleNft;
    return singleNft;
  }

//update
  public async update(nft: ISingleNft): Promise<ISingleNft> {
    const updatedSingleNft: ISingleNft = await SingleNft.findByIdAndUpdate(
      nft._id,
      nft,
      {
        new: true,
      }
    ) as ISingleNft;
    return updatedSingleNft;
  }

  public async getSingleNftByTokenId(tokenId: string): Promise<ISingleNft> {
    const singleNft: ISingleNft = (await SingleNft.findOne({ tokenId })) as ISingleNft;
    return singleNft;
  }

  // async getTopCreators(timeFrame: string, limit: number, page: number) {
  //   const startDate = new Date();
  //   switch (timeFrame) {
  //     case '7':
  //       startDate.setDate(startDate.getDate() - 7);
  //       break;
  //     case '15':
  //       startDate.setDate(startDate.getDate() - 15);
  //       break;
  //     case '30':
  //       startDate.setDate(startDate.getDate() - 30);
  //       break;
  //     default: // '1 day'
  //       startDate.setDate(startDate.getDate() - 1);
  //   }

  //   console.log('startDate', startDate);


  //   const skip = (page - 1) * limit;

  //   const topCreators = await SingleNft.aggregate([
  //     {
  //       $match: {
  //         lastUpdated: { $gte: startDate },
  //         isMinted: true
  //       }
  //     },
  //     {
  //       $group: {
  //         _id: "$creator",
  //         totalVolume: { $sum: "$nftPrice" },
  //         nftCount: { $sum: 1 }
  //       }
  //     },
  //     { $sort: { totalVolume: -1 } },
  //     { $skip: skip },
  //     { $limit: limit },
  //     {
  //       $lookup: {
  //         from: "users",
  //         let: { creatorId: { $toObjectId: "$_id" } },
  //         pipeline: [
  //           { $match: { $expr: { $eq: ["$_id", "$$creatorId"] } } }
  //         ],
  //         as: "creatorInfo"
  //       }
  //     },
  //     {
  //       $project: {
  //         _id: 1,
  //         totalVolume: 1,
  //         nftCount: 1,
  //         name: { $arrayElemAt: ["$creatorInfo.name", 0] },
  //         username: { $arrayElemAt: ["$creatorInfo.username", 0] },
  //         email: { $arrayElemAt: ["$creatorInfo.email", 0] },
  //         profileImage: { $arrayElemAt: ["$creatorInfo.profileImage", 0] },
  //         walletAddress: { $arrayElemAt: ["$creatorInfo.walletAddress", 0] },
  //         walletName: { $arrayElemAt: ["$creatorInfo.walletName", 0] }
  //       }
  //     }
  //   ]);

  //   return topCreators;
  // }


  async getTopCreators(timeFrame: string, limit: number, page: number) {
    const startDate = new Date();
    switch (timeFrame) {
      case '7':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '15':
        startDate.setDate(startDate.getDate() - 15);
        break;
      case '30':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default: // '1 day'
        startDate.setDate(startDate.getDate() - 1);
    }
  
    const skip = (page - 1) * limit;
  
    const topCreators = await SingleNft.aggregate([
      {
        $group: {
          _id: "$creator",
          totalVolume: { $sum: "$nftPrice" },
          nftCount: { $sum: 1 },
          recentVolume: {
            $sum: {
              $cond: [
                { $gte: ["$lastUpdated", startDate] },
                "$nftPrice",
                0
              ]
            }
          },
          recentCount: {
            $sum: {
              $cond: [
                { $gte: ["$lastUpdated", startDate] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { recentVolume: -1, totalVolume: -1 }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          let: { creatorId: { $toObjectId: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$creatorId"] } } }
          ],
          as: "creatorInfo"
        }
      },
      {
        $project: {
          _id: 1,
          totalVolume: 1,
          nftCount: 1,
          recentVolume: 1,
          recentCount: 1,
          name: { $arrayElemAt: ["$creatorInfo.name", 0] },
          username: { $arrayElemAt: ["$creatorInfo.username", 0] },
          email: { $arrayElemAt: ["$creatorInfo.email", 0] },
          profileImage: { $arrayElemAt: ["$creatorInfo.profileImage", 0] },
          walletAddress: { $arrayElemAt: ["$creatorInfo.walletAddress", 0] },
          walletName: { $arrayElemAt: ["$creatorInfo.walletName", 0] },
          verified: { $arrayElemAt: ["$creatorInfo.verified", 0] }
        }
      }
    ]);
  
    return topCreators;
  }

}

export default SingleNftManager.getInstance();
