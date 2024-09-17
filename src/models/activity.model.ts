// import mongoose from "mongoose";
// import { INftActivity } from "../interfaces/activity/activity.interface";


// const nftActivitySchema = new mongoose.Schema({
//     nft: { type: mongoose.Schema.Types.ObjectId, ref: "Nft", required: true, index: true },
//     collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "CollectionMarketPlace", required: true, index: true }, // Changed from 'collection' to 'collectionId'
//     activityType: {
//       type: String,
//       enum: ["mint", "list", "sale", "transfer", "offer", "bid", "cancel_list", "cancel_offer", "cancel_bid", "auction_start", "auction_end"],
//       required: true,
//       index: true
//     },
//     fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
//     toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
//     price: { type: Number },
//     currency: { type: String, default: "KDA" },
//     quantity: { type: Number, default: 1 },
//     transactionHash: { type: String },
//     timestamp: { type: Date, default: Date.now, index: true },
//     additionalInfo: mongoose.Schema.Types.Mixed
//   });
  
//   // Indexes
//   nftActivitySchema.index({ nft: 1, timestamp: -1 });
//   nftActivitySchema.index({ collectionId: 1, timestamp: -1 }); // Changed from 'collection' to 'collectionId'
//   nftActivitySchema.index({ fromUser: 1, timestamp: -1 });
//   nftActivitySchema.index({ toUser: 1, timestamp: -1 });
//   nftActivitySchema.index({ activityType: 1, timestamp: -1 });
  
//   const NftActivity = mongoose.model<INftActivity & mongoose.Document>("NftActivity", nftActivitySchema);
  
//   export default NftActivity;




import mongoose from "mongoose";
import { INftActivity } from "../interfaces/activity/activity.interface";
import { isValidKadenaAddress } from "../utils/addressValidator";

const nftActivitySchema = new mongoose.Schema({
  nft: { type: mongoose.Schema.Types.ObjectId, ref: "Nft", required: true, index: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "CollectionMarketPlace", required: true, index: true },
  activityType: {
    type: String,
    enum: ["mint", "list", "sale", "transfer", "offer", "bid", "cancel_list", "cancel_offer", "cancel_bid", "auction_start", "auction_end"],
    required: true,
    index: true
  },
  fromAddress: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return isValidKadenaAddress(v);
      },
      message: (props: any) => `${props.value} is not a valid Kadena address!`
    }
  },
  toAddress: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return v === null || isValidKadenaAddress(v);  // Allow null or valid address
      },
      message: (props: any) => `${props.value} is not a valid Kadena address!`
    }
  },
  price: { type: Number },
  currency: { type: String, default: "KDA" },
  quantity: { type: Number, default: 1 },
  transactionHash: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  additionalInfo: mongoose.Schema.Types.Mixed
});

// Indexes
nftActivitySchema.index({ nft: 1, timestamp: -1 });
nftActivitySchema.index({ collectionId: 1, timestamp: -1 });
nftActivitySchema.index({ fromAddress: 1, timestamp: -1 });
nftActivitySchema.index({ toAddress: 1, timestamp: -1 });
nftActivitySchema.index({ activityType: 1, timestamp: -1 });

const NftActivity = mongoose.model<INftActivity & mongoose.Document>("NftActivity", nftActivitySchema);

export default NftActivity;