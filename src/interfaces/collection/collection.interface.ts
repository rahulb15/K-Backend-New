export interface ICollection {
  _id: string;
  user: string;
  collectionName: string;
  tokenSymbol: string;
  collectionInfo: string;
  collectionUrl: string;
  category: string;
  imageUrl: string;
  bannerUrl: string;
  totalSupply: number;
  mintPrice: number;
  isActive: boolean;
  tokenList: string[];
  royaltyFee: number;
  royaltyAddress: string;
  totalNftPrice: number;
  totalNft: number;
  minNftPrice: number;
  maxNftPrice: number;
  totalNftUser: number;
  createdDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
