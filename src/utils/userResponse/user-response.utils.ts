import { IUser } from "../../interfaces/user/user.interface";

// export interface IUser {
//   _id?: string;
//   name: string;
//   email: string;
//   bio?: string;
//   gender?: string;
//   walletAddress?: string;
//   walletBalance?: number;
//   walletName?: string;
//   password?: string;
//   is2FAEnabled?: boolean;
//   secret2FA?: string;
//   coverImage?: string;
//   profileImage?: string;
//   role?: string;
//   status?: string;
//   verified?: boolean;
//   social?: {
//     facebook?: string;
//     twitter?: string;
//     linkedin?: string;
//     github?: string;
//     website?: string;
//   };
//   followers?: string[];
//   following?: string[];
//   posts?: string[];
//   comments?: string[];
//   likes?: string[];
//   address?: {
//     house?: string;
//     country?: string;
//     city?: string;
//     street?: string;
//     zip?: string;
//   };
//   phone?: string;
//   socialLogin?: {
//     google?: string;
//     facebook?: string;
//     twitter?: string;
//   };
//   isEmailVerified?: boolean;
//   isPhoneVerified?: boolean;
//   isSocialLogin?: boolean;
//   isActive?: boolean;
//   isDeleted?: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

export const userResponseData = (user: IUser) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress,
    is2FAEnabled: user.is2FAEnabled,
    is2FAVerified: user.is2FAVerified,
    secret2FA: user.secret2FA,
    createdAt: user.createdAt,
  };
};

export const userResponseDataWithToken = (user: IUser, token: string) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress,
    is2FAEnabled: user.is2FAEnabled,
    is2FAVerified: user.is2FAVerified,
    secret2FA: user.secret2FA,
    token,
    createdAt: user.createdAt,
  };
};

export const userResponseDataWithTokenAndRole = (
  user: IUser,
  token: string,
  role: string
) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress,
    is2FAEnabled: user.is2FAEnabled,
    is2FAVerified: user.is2FAVerified,
    secret2FA: user.secret2FA,
    token,
    role,
    createdAt: user.createdAt,
  };
};

export const userResponseDataForProfile = (user: IUser) => {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    isAdminAccess: user.isAdminAccess,
    adminPassword: user.adminPassword,
    email: user.email,
    bio: user.bio,
    gender: user.gender,
    walletAddress: user.walletAddress,
    walletBalance: user.walletBalance,
    walletName: user.walletName,
    isWalletConnected: user.isWalletConnected,
    coverImage: user.coverImage,
    profileImage: user.profileImage,
    role: user.role,
    status: user.status,
    verified: user.verified,
    social: user.social,
    followers: user.followers,
    following: user.following,
    posts: user.posts,
    comments: user.comments,
    likes: user.likes,
    address: user.address,
    phone: user.phone,
    socialLogin: user.socialLogin,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    isSocialLogin: user.isSocialLogin,
    isActive: user.isActive,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const userResponseDataForProfileWithToken = (
  user: IUser,
  token: string
) => {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    isAdminAccess: user.isAdminAccess,
    adminPassword: user.adminPassword,
    email: user.email,
    bio: user.bio,
    gender: user.gender,
    walletAddress: user.walletAddress,
    walletBalance: user.walletBalance,
    walletName: user.walletName,
    isWalletConnected: user.isWalletConnected,
    coverImage: user.coverImage,
    profileImage: user.profileImage,
    role: user.role,
    status: user.status,
    verified: user.verified,
    social: user.social,
    followers: user.followers,
    following: user.following,
    posts: user.posts,
    comments: user.comments,
    likes: user.likes,
    address: user.address,
    phone: user.phone,
    socialLogin: user.socialLogin,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    isSocialLogin: user.isSocialLogin,
    isActive: user.isActive,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token,
  };
};

export const userResponseDataForAdmin = (user: IUser) => {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    isAdminAccess: user.isAdminAccess,
    adminPassword: user.adminPassword,
    email: user.email,
    bio: user.bio,
    gender: user.gender,
    walletAddress: user.walletAddress,
    walletBalance: user.walletBalance,
    walletName: user.walletName,
    isWalletConnected: user.isWalletConnected,
    coverImage: user.coverImage,
    profileImage: user.profileImage,
    role: user.role,
    status: user.status,
    verified: user.verified,
    is2FAEnabled: user.is2FAEnabled,
    is2FAVerified: user.is2FAVerified,
    social: user.social,
    followers: user.followers,
    following: user.following,
    posts: user.posts,
    comments: user.comments,
    likes: user.likes,
    address: user.address,
    phone: user.phone,
    socialLogin: user.socialLogin,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    isSocialLogin: user.isSocialLogin,
    isActive: user.isActive,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
