import { ICollection } from "../../interfaces/collection/collection.interface";
export const collectionResponseData = (collection: ICollection) => {
  return {
    _id: collection._id,
    user: collection.user,
    collectionName: collection.collectionName,
    tokenSymbol: collection.tokenSymbol,
    collectionInfo: collection.collectionInfo,
    collectionUrl: collection.collectionUrl,
    category: collection.category,
    imageUrl: collection.imageUrl,
    bannerUrl: collection.bannerUrl,
    totalSupply: collection.totalSupply,
    mintPrice: collection.mintPrice,
    isActive: collection.isActive,
    tokenList: collection.tokenList,
    royaltyFee: collection.royaltyFee,
    royaltyAddress: collection.royaltyAddress,
    totalNftPrice: collection.totalNftPrice,
    totalNft: collection.totalNft,
    minNftPrice: collection.minNftPrice,
    maxNftPrice: collection.maxNftPrice,
    totalNftUser: collection.totalNftUser,
    createdDate: collection.createdDate,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
};
