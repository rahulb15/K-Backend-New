import mongoose from "mongoose";
import { ICollection } from "../interfaces/collection/collection.interface";

const collectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  applicationId : { type: mongoose.Schema.Types.ObjectId },
  applicationType : { type: String },
  collectionName: { type: String, required: true },
  slug: { type: String, required: false, unique: true },
  tokenSymbol: { type: String, required: false },
  collectionInfo: { type: String, required: false },
  collectionUrl: { type: String, required: false },
  category: { type: String, required: false },
  imageUrl: { type: String, required: false },
  bannerUrl: { type: String, required: false },
  totalSupply: { type: Number, required: false },
  mintPrice: { type: Number, required: false },
  isActive: { type: Boolean, required: false },
  tokenList: { type: [String], required: false },
  totalItems: { type: Number, required: false },
  royaltyFee: { type: Number, required: false },
  royaltyAddress: { type: String, required: false },
  totalNftPrice: { type: Number, required: false },
  totalNft: { type: Number, required: false },
  minNftPrice: { type: Number, required: false },
  maxNftPrice: { type: Number, required: false },
  totalNftUser: { type: Number, required: false },
  createdAt: { type: Date, required: false, default: Date.now },
  updatedAt: { type: Date, required: false, default: Date.now },
});

const Collection = mongoose.model<ICollection & mongoose.Document>(
  "Collection",
  collectionSchema
);

export default Collection;
