export interface IUser {
  _id?: string;
  name: string;
  email: string;
  walletAddress?: string;
  is2FAEnabled?: boolean;
  secret2FA?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
