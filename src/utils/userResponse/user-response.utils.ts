import { IUser } from "../../interfaces/user/user.interface";
export const userResponseData = (user: IUser) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress,
    is2FAEnabled: user.is2FAEnabled,
    secret2FA: user.secret2FA,
    createdAt: user.createdAt,
  };
};
