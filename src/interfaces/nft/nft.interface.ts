import mongoose from "mongoose";

// export interface IBidInfo {
//   userId: mongoose.Types.ObjectId | string;
//   amount: number;
//   timestamp: Date;
// }
export interface IBidInfo {
  bidderAddress: string; // Kadena address of the bidder
  amount: number;
  timestamp: Date;
}

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
  bidInfo: IBidInfo[];
  onAuction: boolean;
  onDutchAuction: boolean;
  sellingType: string;
  creatorName: string;
  duration: string;
  roylaities: string;
  properties: string[];
  attributes: string[];
  likes: number;
  policies?: string;
  uri?: string;
  owner?: string; // Kadena address of the owner
}

export interface INfts {
  nfts: INft[];
}
