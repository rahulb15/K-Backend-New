import mongoose from "mongoose";
import { IUser } from "../interfaces/user/user.interface";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    walletAddress: { type: String, required: false, trim: true },
    is2FAEnabled: { type: Boolean, default: false },
    secret2FA: { type: String, required: false, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;