import mongoose, { Schema } from "mongoose";
import { ILaunchCollection } from "../interfaces/launch-collection/launch-collection.interface";

const launchCollectionSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collectionName: { type: String },
  creatorName: { type: String },
  creatorWallet: { type: String },
  creatorEmail: { type: String },
  projectDescription: { type: String },
  projectCategory: { type: String },
  expectedLaunchDate: { type: String },
  twitter: { type: String },
  discord: { type: String },
  instagram: { type: String },
  website: { type: String },
  totalSupply: { type: String },
  contractType: { type: String },
  royaltyPercentage: { type: String },
  mintPrice: { type: String },
  mintPriceCurrency: { type: String },
  tokenList: { type: [String] },
  policy: { type: [String] },
  collectionCoverImage: { type: String },
  collectionBannerImage: { type: String },
  mintStartDate: { type: Date },
  mintStartTime: { type: String },
  mintEndDate: { type: Date },
  mintEndTime: { type: String },
  allowFreeMints: { type: Boolean, default: false },
  enableWhitelist: { type: Boolean, default: false },
  whitelistAddresses: { type: [String] },
  whitelistStartDate: { type: String },
  whitelistStartTime: { type: String },
  whitelistStartDateAndTime: { type: Date },
  whitelistPrice: { type: String },
  reservePrice: { type: Number, default: 0 },

  enablePresale: { type: Boolean, default: false },
  presaleStartDate: { type: String },
  presaleStartTime: { type: String },
  presaleStartDateAndTime: { type: Date },
  presaleEndDate: { type: String },
  presaleEndTime: { type: String },
  presaleEndDateAndTime: { type: Date },
  presalePrice: { type: String },
  presaleAddressess: { type: [String] },
  enableAirdrop : { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  paymentMode: { type: String },
  transactionId: { type: String },
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  isLaunched: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LaunchCollection = mongoose.model<ILaunchCollection>(
  "LaunchCollection",
  launchCollectionSchema
);

export default LaunchCollection;
