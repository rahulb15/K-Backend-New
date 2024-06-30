import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { ICart } from "../../interfaces/cart/cart.interface";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import cartManager from "../../services/cart.manager";
import { cartResponseData } from "../../utils/userResponse/cart-response.utils";

export class CartController {
  private static instance: CartController;

  // private constructor() {}

  public static getInstance(): CartController {
    if (!CartController.instance) {
      CartController.instance = new CartController();
    }

    return CartController.instance;
  }

  public async create(req: any, res: Response) {
    try {
      const { nftIds } = req.body;
      const userId: mongoose.Types.ObjectId = req.user._id;
      console.log(userId, nftIds, "userId, nftIds");
      const userCart: any = await cartManager.getByUserId(userId);
      console.log(userCart, "userCart");
      if (userCart) {
        const nftIdsArray = userCart.nfts;
        nftIds.forEach((nfts: mongoose.Types.ObjectId) => {
          if (!nftIdsArray.includes(nfts)) {
            nftIdsArray.push(nfts);
          }
        });

        userCart.nfts = nftIdsArray;

        const updatedCart: ICart = await cartManager.update(
          new mongoose.Types.ObjectId(userCart._id),
          userCart
        );
        const responseData: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.UPDATED,
          description: ResponseDescription.UPDATED,
          data: cartResponseData(updatedCart),
        };
        return res.status(ResponseCode.UPDATED).json(responseData);
      }
      const newCart: ICart = await cartManager.create({
        user: userId,
        nfts: nftIds,
      });
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: cartResponseData(newCart),
      };
      return res.status(ResponseCode.CREATED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async getAll(req: Request, res: Response) {
    try {
      const carts: ICart[] = await cartManager.getAll();
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: carts.map((cart) => cartResponseData(cart)),
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const cart: ICart = await cartManager.getById(id);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: cartResponseData(cart),
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.NOT_FOUND,
        description: ResponseDescription.NOT_FOUND,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
        req.params.id
      );
      const cart: ICart = req.body;
      const updateCart: ICart = await cartManager.update(id, cart);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.UPDATED,
        description: ResponseDescription.UPDATED,
        data: cartResponseData(updateCart),
      };
      return res.status(ResponseCode.UPDATED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const cart: ICart = await cartManager.delete(id);
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.DELETED,
        description: ResponseDescription.DELETED,
        data: cartResponseData(cart),
      };
      return res.status(ResponseCode.DELETED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async addNft(req: any, res: Response) {
    try {
      const { nftId } = req.body;
      const userId: mongoose.Types.ObjectId = req.user._id;
      const userCart: any = await cartManager.getByUserId(userId);
      if (userCart) {
        const nftIdsArray = userCart.nfts;
        if (!nftIdsArray.includes(nftId)) {
          nftIdsArray.push(nftId);
        }

        userCart.nfts = nftIdsArray;

        const updatedCart: ICart = await cartManager.update(
          new mongoose.Types.ObjectId(userCart._id),
          userCart
        );
        const responseData: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.UPDATED,
          description: ResponseDescription.UPDATED,
          data: cartResponseData(updatedCart),
        };
        return res.status(ResponseCode.UPDATED).json(responseData);
      }
      const newCart: ICart = await cartManager.create({
        user: userId,
        nfts: [nftId],
      });
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: cartResponseData(newCart),
      };
      return res.status(ResponseCode.CREATED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async removeNft(req: any, res: Response) {
    try {
      const { nftId } = req.body;
      const userId: mongoose.Types.ObjectId = req.user._id;
      const userCart: any = await cartManager.getByUserId(userId);
      if (userCart) {
        const nftIdsArray = userCart.nfts;
        const index = nftIdsArray.indexOf(nftId);
        if (index > -1) {
          nftIdsArray.splice(index, 1);
        }

        userCart.nfts = nftIdsArray;

        const updatedCart: ICart = await cartManager.update(
          new mongoose.Types.ObjectId(userCart._id),
          userCart
        );
        const responseData: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.UPDATED,
          description: ResponseDescription.UPDATED,
          data: cartResponseData(updatedCart),
        };
        return res.status(ResponseCode.UPDATED).json(responseData);
      }
      const newCart: ICart = await cartManager.create({
        user: userId,
        nfts: [nftId],
      });
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: cartResponseData(newCart),
      };
      return res.status(ResponseCode.CREATED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async clearCart(req: any, res: Response) {
    try {
      const userId: mongoose.Types.ObjectId = req.user._id;
      const userCart: any = await cartManager.getByUserId(userId);
      if (userCart) {
        userCart.nfts = [];
        const updatedCart: ICart = await cartManager.update(
          new mongoose.Types.ObjectId(userCart._id),
          userCart
        );
        const responseData: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.UPDATED,
          description: ResponseDescription.UPDATED,
          data: cartResponseData(updatedCart),
        };
        return res.status(ResponseCode.UPDATED).json(responseData);
      }
      const newCart: ICart = await cartManager.create({
        user: userId,
        nfts: [],
      });
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: cartResponseData(newCart),
      };
      return res.status(ResponseCode.CREATED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async getCart(req: any, res: Response) {
    try {
      const userId: mongoose.Types.ObjectId = req.user._id;
      const userCart: any = await cartManager.getByUserId(userId);
      if (userCart) {
        const responseData: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: cartResponseData(userCart),
        };
        return res.status(ResponseCode.SUCCESS).json(responseData);
      }
      const newCart: ICart = await cartManager.create({
        user: userId,
        nfts: [],
      });
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: cartResponseData(newCart),
      };
      return res.status(ResponseCode.CREATED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }
}

export default CartController.getInstance();
