import { NextFunction, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../enum/response-message.enum";
import { IResponseHandler } from "../interfaces/response-handler.interface";
import userManager from "../services/user.manager";
import { jwtVerify } from "../utils/jwt.sign";

export const adminMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token,"ttttttttttttt");
    if (!token) {
      const response: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.UNAUTHORIZED,
        description: ResponseDescription.UNAUTHORIZED,
        data: null,
      };
      return res.status(ResponseCode.UNAUTHORIZED).json(response);
    }
    console.log("JWT VERIFYING... ");
    const decoded: any = await jwtVerify(token, true);
    console.log("DECODED: ", decoded);
    //check if user exists in db
    const user = await userManager.getById(decoded.id);
    if (!user) {
      const response: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.UNAUTHORIZED,
        description: ResponseDescription.UNAUTHORIZED,
        data: null,
      };
      return res.status(ResponseCode.UNAUTHORIZED).json(response);
    }
    req.user = user;
    next();
  } catch (error) {
    const response: IResponseHandler = {
      status: ResponseStatus.FAILED,
      message: ResponseMessage.UNAUTHORIZED,
      description: ResponseDescription.UNAUTHORIZED,
      data: null,
    };
    return res.status(ResponseCode.UNAUTHORIZED).json(response);
  }
};
