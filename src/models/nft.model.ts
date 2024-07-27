import mongoose from "mongoose";
import { INft } from "../interfaces/nft/nft.interface";

const nftSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  collectionId: { type: mongoose.Schema.Types.ObjectId },
  collectionType: { type: String },
  AccountId: { type: String },
  collectionName: { type: String },
  creator: { type: String },
  tokenImage: { type: String },
  tokenId: { type: String },
  nftPrice: { type: Number },
  unlockable: { type: Boolean },
  isRevealed: { type: Boolean, default: false },
  digitalCode: { type: String },
  onMarketplace: { type: Boolean },
  onSale: { type: Boolean },
  bidInfo: { type: Array },
  onAuction: { type: Boolean },
  sellingType: { type: String, default: "All" },
  creatorName: { type: String },
  duration: { type: String },
  roylaities: { type: String },
  properties: { type: Array },
  likes: { type: Number },
});

const Nft = mongoose.model<INft & mongoose.Document>("Nft", nftSchema);

export default Nft;
