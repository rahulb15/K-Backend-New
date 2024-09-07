export interface INft {
  _id?: string;
  user: string;
  collectionId?: string;
  collectionType: string;
  collectionName: string;
  creator: string;
  tokenImage: string;
  tokenId: string;
  nftPrice: number;
  unlockable: boolean;
  isRevealed: boolean;
  digitalCode: string;
  onMarketplace: boolean;
  onSale: boolean;
  bidInfo: string[];
  onAuction: boolean;
  sellingType: string;
  creatorName: string;
  duration: string;
  roylaities: string;
  properties: string[];
  attributes: string[];
  likes: number;
  policies?: string;
  uri?: string;
}

export interface INfts {
  nfts: INft[];
}
