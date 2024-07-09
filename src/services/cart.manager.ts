import mongoose from "mongoose";
import { ICart } from "../interfaces/cart/cart.interface";
import { ICartManager } from "../interfaces/cart/cart.manager.interface";
import Cart from "../models/cart.model";

export class CartManager implements ICartManager {
  private static instance: CartManager;

  // private constructor() {}

  public static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    }

    return CartManager.instance;
  }

  public async create(cart: ICart): Promise<ICart> {
    const newCart = new Cart(cart);
    return newCart.save();
  }

  public async getAll(): Promise<ICart[]> {
    return Cart.find();
  }

  public async getById(id: string): Promise<ICart> {
    const cart = await Cart.findById(id);
    if (!cart) {
      throw new Error("Cart not found");
    }
    return cart;
  }

  public async getByUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<ICart | null> {
    return Cart.findOne({ user: userId });
  }

  public async update(
    id: mongoose.Types.ObjectId,
    cart: ICart
  ): Promise<ICart> {
    const updatedCart = await Cart.findByIdAndUpdate(id, cart, { new: true });
    if (!updatedCart) {
      throw new Error("Cart not found");
    }
    return updatedCart;
  }

  public async delete(id: string): Promise<ICart> {
    const deletedCart = await Cart.findByIdAndDelete(id);
    if (!deletedCart) {
      throw new Error("Cart not found");
    }
    return deletedCart;
  }
}

export default CartManager.getInstance();
