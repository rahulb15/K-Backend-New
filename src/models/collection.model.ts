import mongoose from "mongoose";
import { ICollection } from "../interfaces/collection/collection.interface";

const collectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, index: true },
  applicationType: { type: String, index: true },
  collectionName: { type: String, required: true, index: true },
  slug: { type: String, index: true }, // Removed unique constraint
  tokenSymbol: { type: String },
  collectionInfo: { type: String },
  collectionUrl: { type: String },
  category: { type: String, index: true },
  imageUrl: { type: String },
  bannerUrl: { type: String },
  totalSupply: { type: Number, index: true },
  mintPrice: { type: Number, index: true },
  isActive: { type: Boolean, default: true, index: true },
  tokenList: { type: [String] },
  totalItems: { type: Number, index: true },
  royaltyFee: { type: Number },
  royaltyAddress: { type: String },
  totalNftPrice: { type: Number },
  totalNft: { type: Number, index: true },
  minNftPrice: { type: Number, index: true },
  maxNftPrice: { type: Number, index: true },
  totalNftUser: { type: Number },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true },
  collectionId: { type: String, required: true, unique: true, index: true },
  size: { type: String },
  maxSize: { type: String },
  creator: { type: String, index: true },
  creatorGuard: { type: mongoose.Schema.Types.Mixed },
  tokens: { type: [String] },
  firstTokenData: { type: mongoose.Schema.Types.Mixed },
  lastUpdated: { type: Date, index: true },
  collectionCoverImage: { type: String },
  collectionBannerImage: { type: String },
  reservePrice: { type: Number, index: true },
});

// Compound indexes
collectionSchema.index({ collectionName: 1, creator: 1 }, { unique: true });
collectionSchema.index({ createdAt: -1, isActive: 1 });
collectionSchema.index({ totalSupply: -1, isActive: 1 });
collectionSchema.index({ mintPrice: 1, isActive: 1 });

const Collection = mongoose.model<ICollection & mongoose.Document>("Collection", collectionSchema);

export default Collection;