import { INft } from './nft.interface';
export interface INftManager {
  create(nft: INft): Promise<INft>;
  getAll(): Promise<INft[]>;
  getById(id: string): Promise<INft>;
}

