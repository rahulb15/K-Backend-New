export interface IUser {
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  gender?: string;
  walletAddress?: string;
  walletBalance?: number;
  walletName?: string;
  isWalletConnected?: boolean;
  password?: string;
  is2FAEnabled?: boolean;
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
    house?: string;
    country?: string;
    city?: string;
    street?: string;
    zip?: string;
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
