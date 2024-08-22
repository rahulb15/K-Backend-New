export interface ICollection {
  _id?: string;
  user: string;
  applicationId: string;
  applicationType: string;
  collectionName: string;
  slug: string;
  tokenSymbol?: string;
  collectionInfo?: string;
  collectionUrl?: string;
  category: string;
  imageUrl?: string;
  bannerUrl?: string;
  totalSupply: number;
  mintPrice: number;
  isActive: boolean;
  tokenList?: string[];
  totalItems?: number;
  royaltyFee?: number;
  royaltyAddress?: string;
  totalNftPrice?: number;
  totalNft: number;
  minNftPrice?: number;
  maxNftPrice?: number;
  totalNftUser?: number;
  createdAt?: Date;
  updatedAt?: Date;
  collectionId: string;
  size?: string;
  maxSize?: string;
  creator: string;
  creatorGuard?: any; // Use `any` or a more specific type if you know the structure of this field
  tokens?: string[];
  firstTokenData?: any; // Use `any` or a more specific type if you know the structure of this field
  lastUpdated?: Date;
  collectionCoverImage?: string;
  collectionBannerImage?: string;
  reservePrice?: number;
}
