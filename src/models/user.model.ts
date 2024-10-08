import mongoose from "mongoose";
import { hashPassword } from ".././utils/hash.password";
import { IUser } from "../interfaces/user/user.interface";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: false, trim: true },
    isAdminAccess: { type: Boolean, default: false },
    adminPassword: { type: String, required: false },
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
    is2FAVerified: { type: Boolean, default: false },
    secret2FA: { type: String, required: false, trim: true },
    coverImage: { type: String, required: false, trim: true },
    profileImage: { type: String, required: false, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
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
      address1: { type: String, required: false, trim: true },
      address2: { type: String, required: false, trim: true },
      country: { type: mongoose.SchemaTypes.Mixed, required: false },
      city: { type: mongoose.SchemaTypes.Mixed, required: false },
      state: { type: mongoose.SchemaTypes.Mixed, required: false },
      zip: { type: Number, required: false },
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

// Initialize super admin if it doesn't exist
async function initSuperAdmin() {
  try {
    const superAdmin = await User.findOne({ role: "superadmin" });
    if (!superAdmin) {
      const newSuperAdmin = new User({
        name: "Super Admin",
        email: "superadmin@yopmail.com",
        password: await hashPassword("superadmin"),
        role: "superadmin",
        verified: true,
        walletName: "Chainweaver",
        // walletAddress:
        //   "k:56609bf9d1983f0c13aaf3bd3537fe00db65eb15160463bb641530143d4e9bcf",
        walletAddress: process.env.NODE_ENV === "development" ? process.env.DEV_ADMIN_ADDRESS : process.env.PROD_ADMIN_ADDRESS,
      });
      await newSuperAdmin.save();
      console.log("Super admin user created successfully.");
    } else {
      console.log("Super admin user already exists.");
    }
  } catch (error) {
    console.error("Error initializing super admin:", error);
  }
}

// Initialize admin if it doesn't exist
async function initAdmin() {
  try {
    const superAdmin = await User.findOne({ role: "admin" });
    if (!superAdmin) {
      const newSuperAdmin = new User({
        name: "Admin",
        email: "admin@yopmail.com",
        password: await hashPassword("Admin@123"),
        role: "admin",
        verified: true,
        walletName: "Ecko Wallet",
        walletAddress:
          "k:a2ff4689f89f0f3bb6a32fa35b8547c0cb4070f6b4af76fb53892f44fe1f9069",
      });
      await newSuperAdmin.save();
      console.log("admin user created successfully.");
    } else {
      console.log("admin user already exists.");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
}

// Call the initialization function
initSuperAdmin();
// initAdmin();
