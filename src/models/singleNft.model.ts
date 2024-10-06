import mongoose from "mongoose";
import { ISingleNft } from "../interfaces/singleNft/singleNft.interface";

const singleNftSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  nftName: { type: String },
  AccountId: { type: String },
  creator: { type: String },
  tokenImage: { type: String },
  tokenId: { type: String },
  nftPrice: { type: Number },
  unlockable: { type: Boolean },
  isRevealed: { type: Boolean, default: false },
  isMinted: { type: Boolean, default: false },
  digitalCode: { type: String },
  onMarketplace: { type: Boolean },
  onSale: { type: Boolean },
  bidInfo: { type: Array },
  onAuction: { type: Boolean },
  onDutchAuction: { type: Boolean },
  sellingType: { type: String, default: "All" },
  creatorName: { type: String },
  duration: { type: String },
  roylaities: { type: String },
  properties: { type: Array },
  attributes: { type: Array },
  likes: { type: Number },
  // New fields
  isPlatform: { type: Boolean, default: false },
  saleType: { type: String, enum: ['f', 'a', 'd'] },
  saleId: { type: String },
  price: { type: String },
  amount: { type: String },
  timeout: { type: Date },
  currency: { type: String },
  enabled: { type: Boolean },
  seller: { type: String },
  recipient: { type: String },
  escrowAccount: { type: String },
  startPrice:{type: Number },
  endPrice:{type: Number},
  startTime:{type: Date},
  endTime:{type: Date},
  incrementRatio:{type: Number},
  currentPrice:{type: Number},
  currentBuyer: { type: String },
  uri: { type: String },
  supply: { type: Object },
  policies: { type: [String] },
  collection: { type: Object },
  nftData: { type: Object },
  rarityScore: { type: Number },
  rarityRank: { type: Number },
  traitCount: { type: Number },
  royaltyAccount: { type: String },
  royaltyPercentage: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
});

// Indexes
singleNftSchema.index({ tokenId: 1 }, { unique: false }); // Changed to non-unique
singleNftSchema.index({ user: 1 });
singleNftSchema.index({ creator: 1 });
singleNftSchema.index({ onMarketplace: 1 });
singleNftSchema.index({ onSale: 1 });
singleNftSchema.index({ onAuction: 1 });
singleNftSchema.index({ onDutchAuction: 1 });
singleNftSchema.index({ saleType: 1 });
singleNftSchema.index({ saleId: 1 });
singleNftSchema.index({ seller: 1 });
singleNftSchema.index({ lastUpdated: -1 });

// Compound indexes
singleNftSchema.index({ creator: 1, onMarketplace: 1 });
singleNftSchema.index({ saleType: 1, price: 1 });

const SingleNft = mongoose.model<ISingleNft & mongoose.Document>("SingleNft", singleNftSchema);

export default SingleNft;