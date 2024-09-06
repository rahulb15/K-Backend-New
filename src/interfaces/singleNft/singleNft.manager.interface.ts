import { ISingleNft } from "./singleNft.interface";

export interface ISingleNftManager {
  create(nft: ISingleNft): Promise<ISingleNft>;

  getAll(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ singleNfts: ISingleNft[]; total: number; }>;
  getById(id: string): Promise<ISingleNft>;
}
