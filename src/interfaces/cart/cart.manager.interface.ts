import { ICart } from "./cart.interface";
export interface ICartManager {
  create(cart: ICart): Promise<ICart>;
  getAll(): Promise<ICart[]>;
  getById(id: string): Promise<ICart>;
}
