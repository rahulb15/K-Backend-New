import mongoose from "mongoose";

export interface INftActivity extends mongoose.Document {
  nft: mongoose.Types.ObjectId;
  collectionId: mongoose.Types.ObjectId; // Changed from 'collection' to 'collectionId'
  activityType: "mint" | "list" | "sale" | "transfer" | "offer" | "bid" | "cancel_list" | "cancel_offer" | "cancel_bid" | "auction_start" | "auction_end";
  fromUser: mongoose.Types.ObjectId;
  toUser?: mongoose.Types.ObjectId;
  price?: number;
  currency?: string;
  quantity?: number;
  transactionHash?: string;
  timestamp: Date;
  additionalInfo?: any;
}