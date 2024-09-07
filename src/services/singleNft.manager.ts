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
      user: new mongoose.Types.ObjectId(userId),
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

}

export default SingleNftManager.getInstance();
