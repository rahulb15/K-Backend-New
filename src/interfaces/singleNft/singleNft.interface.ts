export interface ISingleNft {
  _id?: string;
  user: string;
  nftName: string;
  creator: string;
  tokenImage: string;
  tokenId: string;
  nftPrice: number;
  unlockable: boolean;
  isRevealed: boolean;
  isMinted: boolean;
  digitalCode: string;
  onMarketplace: boolean;
  onSale: boolean;
  bidInfo: string[];
  onAuction: boolean;
  onDutchAuction: boolean;
  sellingType: string;
  creatorName: string;
  duration: string;
  properties: string[];
  attributes: string[];
  likes: number;
  policies: string[];
  uri: string;
  royaltyAccount: string;
  royaltyPercentage: number;
}

// export interface ISingleNft {
//   nfts: ISingleNft[];
// }
