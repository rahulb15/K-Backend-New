import { ICart } from "../../interfaces/cart/cart.interface";

export const cartResponseData = (cart: ICart) => {
  return {
    _id: cart._id,
    user: cart.user,
    nfts: cart.nfts,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};
