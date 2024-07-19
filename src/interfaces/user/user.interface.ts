export interface IUser {
  _id?: string;
  name: string;
  username?: string;
  isAdminAccess?: boolean;
  adminPassword?: string;
  email: string;
  bio?: string;
  gender?: string;
  walletAddress?: string;
  walletBalance?: number;
  walletName?: string;
  isWalletConnected?: boolean;
  password?: string;
  is2FAEnabled?: boolean;
  is2FAVerified?: boolean;
  secret2FA?: string;
  coverImage?: string;
  profileImage?: string;
  role?: string;
  status?: string;
  verified?: boolean;
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  followers?: string[];
  following?: string[];
  posts?: string[];
  comments?: string[];
  likes?: string[];
  address?: {
    house1?: string;
    house2?: string;
    country?: any;
    city?: any;
    state?: any;
    zip?: number;
  };
  phone?: string;
  socialLogin?: {
    google?: string;
    facebook?: string;
    twitter?: string;
  };
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isSocialLogin?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserVerification {
  verified: boolean;
}
