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
    bio: { type: String, required: false, trim: true },
    gender: { type: String, required: false, trim: true },
    walletAddress: { type: String, required: false, trim: true },
    walletBalance: { type: Number, required: false, default: 0 },
    walletName: { type: String, required: false, trim: true },
    isWalletConnected: { type: Boolean, default: false },
    password: { type: String, required: false },
    is2FAEnabled: { type: Boolean, default: false },
    secret2FA: { type: String, required: false, trim: true },
    coverImage: { type: String, required: false, trim: true },
    profileImage: { type: String, required: false, trim: true },
    role: { type: String, required: true, default: "user" },
    status: { type: String, required: true, default: "active" },
    verified: { type: Boolean, default: false },
    social: {
      facebook: { type: String, required: false, trim: true },
      twitter: { type: String, required: false, trim: true },
      linkedin: { type: String, required: false, trim: true },
      github: { type: String, required: false, trim: true },
      website: { type: String, required: false, trim: true },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    address: {
      house: { type: String, required: false, trim: true },
      country: { type: String, required: false, trim: true },
      city: { type: String, required: false, trim: true },
      street: { type: String, required: false, trim: true },
      zip: { type: String, required: false, trim: true },
    },
    phone: { type: String, required: false, trim: true },
    socialLogin: {
      google: { type: String, required: false, trim: true },
      facebook: { type: String, required: false, trim: true },
      twitter: { type: String, required: false, trim: true },
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isSocialLogin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
