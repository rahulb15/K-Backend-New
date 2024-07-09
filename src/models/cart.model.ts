import mongoose from "mongoose";
import { ICart } from "../interfaces/cart/cart.interface";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nfts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Nft" }],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
