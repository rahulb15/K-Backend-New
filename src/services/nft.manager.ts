import { INft } from "../interfaces/nft/nft.interface";
import { INftManager } from "../interfaces/nft/nft.manager.interface";
import Nft from "../models/nft.model";

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

  public async getAll(): Promise<INft[]> {
    return Nft.find();
  }

  public async getById(id: string): Promise<INft> {
    const nft: INft = (await Nft.findById(id)) as INft;
    return nft;
  }
}

export default NftManager.getInstance();
