import { INft } from "./nft.interface";

export interface INftManager {
  create(nft: INft): Promise<INft>;

  getAll(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }>;
  getById(id: string): Promise<INft>;
}
