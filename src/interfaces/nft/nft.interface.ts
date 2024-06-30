export interface INft {
  _id: string;
  user: string;
  collectionId: string;
  onMarketplace: boolean;
  onSale: boolean;
  bidInfo: any[];
  onAuction: boolean;
  sellingType: string;
  creatorName: string;
  duration: string;
  nftPrice: string;
  unlockable: boolean;
  tokenId: string;
  isRevealed: boolean;
  digitalCode: string;
  description: string;
  externalLink: string;
  roylaities: string;
  properties1: string;
  properties2: string;
  likes: string;
  collectionName: string;
  creator: string;
  tokenImage: string;
  hash: string;
  imageIndex: string;
  history: any[];
  chartPrice: any[];
  views: number;
  fileImageUrl: string;
  fileName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INfts {
  nfts: INft[];
}
