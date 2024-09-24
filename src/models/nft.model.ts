import mongoose from "mongoose";
import { INft } from "../interfaces/nft/nft.interface";
import { isValidKadenaAddress } from "../utils/addressValidator";

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
  uri: { type: String },
  supply: { type: Object },
  policies: { type: [String] },
  collection: { type: Object },
  nftData: { type: Object },
  rarityScore: { type: Number },
  rarityRank: { type: Number },
  traitCount: { type: Number },
  owner: { 
    type: String, 
    validate: {
      validator: function(v: string) {
        return isValidKadenaAddress(v);
      },
      message: (props: any) => `${props.value} is not a valid Kadena address!`
    }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Indexes
nftSchema.index({ tokenId: 1 }, { unique: false }); // Changed to non-unique
nftSchema.index({ user: 1 });
nftSchema.index({ collectionId: 1 });
nftSchema.index({ creator: 1 });
nftSchema.index({ onMarketplace: 1 });
nftSchema.index({ onSale: 1 });
nftSchema.index({ onAuction: 1 });
nftSchema.index({ saleType: 1 });
nftSchema.index({ saleId: 1 });
nftSchema.index({ seller: 1 });
nftSchema.index({ lastUpdated: -1 });

// Compound indexes
nftSchema.index({ collectionId: 1, onSale: 1 });
nftSchema.index({ creator: 1, onMarketplace: 1 });
nftSchema.index({ saleType: 1, price: 1 });

const Nft = mongoose.model<INft & mongoose.Document>("Nft", nftSchema);

export default Nft;