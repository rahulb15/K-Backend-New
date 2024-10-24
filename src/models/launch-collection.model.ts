import mongoose, { Schema } from "mongoose";
import { ILaunchCollection } from "../interfaces/launch-collection/launch-collection.interface";

const launchCollectionSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  collectionName: { type: String, index: true },
  creatorName: { type: String, index: true },
  creatorWallet: { type: String, index: true },
  collectionType: { type: String, default: "launchpad" },
  creatorEmail: { type: String },
  projectDescription: { type: String },
  projectCategory: { type: String, index: true },
  musicSubCategory: { type: String },
  expectedLaunchDate: { type: String },
  twitter: { type: String },
  discord: { type: String },
  socialMediaLinks: { type: Schema.Types.Mixed},
  instagram: { type: String },
  website: { type: String },
  totalSupply: { type: String },
  contractType: { type: String },
  royaltyPercentage: { type: String },
  mintPrice: { type: String },
  mintPriceCurrency: { type: String },
  tokenList: { type: [String] },
  uriList: { type: [String] },
  mintedUriList: { type: [String] },
  policy: { type: [String] },
  collectionCoverImage: { type: String },
  collectionBannerImage: { type: String },
  mintStartDate: { type: Date, index: true },
  mintStartTime: { type: String },
  mintEndDate: { type: Date, index: true },
  mintEndTime: { type: String },
  allowFreeMints: { type: Boolean, default: false },
  enableWhitelist: { type: Boolean, default: false },
  whitelistAddresses: { type: [String] },
  whitelistStartDate: { type: String },
  whitelistStartTime: { type: String },
  whitelistStartDateAndTime: { type: Date, index: true },
  whitelistPrice: { type: String },
  reservePrice: { type: Number, default: 0 },
  enablePresale: { type: Boolean, default: false },
  presaleStartDate: { type: String },
  presaleStartTime: { type: String },
  presaleStartDateAndTime: { type: Date, index: true },
  presaleEndDate: { type: String },
  presaleEndTime: { type: String },
  presaleEndDateAndTime: { type: Date, index: true },
  presalePrice: { type: String },
  presaleAddressess: { type: [String] },
  enableAirdrop: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false, index: true },
  paymentMode: { type: String },
  transactionId: { type: String },
  isApproved: { type: Boolean, default: false, index: true },
  isRejected: { type: Boolean, default: false, index: true },
  isLaunched: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true },
  // New fields from CollectionProcessingService
  collectionId: { type: String, index: true},
  size: { type: String },
  maxSize: { type: String },
  creator: { type: String, index: true },
  creatorGuard: { type: Schema.Types.Mixed },
  tokens: { type: [String] },
  firstTokenData: { type: Schema.Types.Mixed },
  lastUpdated: { type: Date, index: true },
});

// Compound indexes
launchCollectionSchema.index({ collectionName: 1, creatorWallet: 1 });
launchCollectionSchema.index({ mintStartDate: 1, mintEndDate: 1 });
launchCollectionSchema.index({ presaleStartDateAndTime: 1, presaleEndDateAndTime: 1 });

const LaunchCollection = mongoose.model<ILaunchCollection>(
  "LaunchCollection",
  launchCollectionSchema
);

export default LaunchCollection;