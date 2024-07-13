import { ILaunchCollection } from "../../interfaces/launch-collection/launch-collection.interface";

export const launchCollectionResponseData = (collection: ILaunchCollection) => {
  return {
    collectionName: collection.collectionName,
    creatorName: collection.creatorName,
    creatorWallet: collection.creatorWallet,
    creatorEmail: collection.creatorEmail,
    projectDescription: collection.projectDescription,
    projectCategory: collection.projectCategory,
    expectedLaunchDate: collection.expectedLaunchDate,
    twitter: collection.twitter,
    discord: collection.discord,
    instagram: collection.instagram,
    website: collection.website,
    totalSupply: collection.totalSupply,
    contractType: collection.contractType,
    royaltyPercentage: collection.royaltyPercentage,
    mintPrice: collection.mintPrice,
    mintPriceCurrency: collection.mintPriceCurrency,
    collectionCoverImage: collection.collectionCoverImage,
    collectionBannerImage: collection.collectionBannerImage,
    mintStartDate: collection.mintStartDate,
    mintStartTime: collection.mintStartTime,
    allowFreeMints: collection.allowFreeMints,
    enableWhitelist: collection.enableWhitelist,
    enablePresale: collection.enablePresale,
    enableAirdrop : collection.enableAirdrop,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
};

export const adminLaunchCollectionResponseData = (
  collection: ILaunchCollection
) => {
  return {
    collectionName: collection.collectionName,
    creatorName: collection.creatorName,
    creatorWallet: collection.creatorWallet,
    creatorEmail: collection.creatorEmail,
    projectDescription: collection.projectDescription,
    projectCategory: collection.projectCategory,
    expectedLaunchDate: collection.expectedLaunchDate,
    twitter: collection.twitter,
    discord: collection.discord,
    instagram: collection.instagram,
    website: collection.website,
    totalSupply: collection.totalSupply,
    contractType: collection.contractType,
    royaltyPercentage: collection.royaltyPercentage,
    mintPrice: collection.mintPrice,
    mintPriceCurrency: collection.mintPriceCurrency,
    collectionCoverImage: collection.collectionCoverImage,
    collectionBannerImage: collection.collectionBannerImage,
    mintStartDate: collection.mintStartDate,
    mintStartTime: collection.mintStartTime,
    allowFreeMints: collection.allowFreeMints,
    enableWhitelist: collection.enableWhitelist,
    enablePresale: collection.enablePresale,
    enableAirdrop : collection.enableAirdrop,
    isPaid: collection.isPaid,
    transactionId: collection.transactionId,
    isApproved: collection.isApproved,
    isRejected: collection.isRejected,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
};
