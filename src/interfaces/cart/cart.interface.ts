import { Types } from "mongoose";

export interface ICart {
  _id?: string; // Make _id optional
  user: Types.ObjectId; // Store user's ObjectId
  nfts: Types.ObjectId[]; // Array of NFT IDs
  createdAt?: Date;
  updatedAt?: Date;
}
