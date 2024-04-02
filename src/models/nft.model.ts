import mongoose from 'mongoose';
import { INft } from '../interfaces/nft/nft.interface';

const nftSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  onMarketplace: { type: Boolean },
  onSale: { type: Boolean },
  bidInfo: { type: Array },
  onAuction: { type: Boolean },
  sellingType: { type: String, default: 'All' },
  creatorName: { type: String },
  duration: { type: String },
  nftPrice: { type: String },
  unlockable: { type: Boolean },
  tokenId: { type: String },
  isRevealed: { type: Boolean, default: false },
  digitalCode: { type: String },
  description: { type: String },
  externalLink: { type: String },
  roylaities: { type: String },
  properties1: { type: String },
  properties2: { type: String },
  likes: { type: String },
  collectionName: { type: String },
  creator: { type: String },
  tokenImage: { type: String },
  hash: { type: String },
  imageIndex: { type: String },
  views: { type: Number, default: 0 },
  fileImageUrl: { type: String },
  fileName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Nft = mongoose.model<INft & mongoose.Document>('Nft', nftSchema);

export default Nft;
