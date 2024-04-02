import { Response, NextFunction } from 'express';
import { ResponseCode, ResponseMessage, ResponseDescription, ResponseStatus } from '../enum/response-message.enum';
import { IResponseHandler } from '../interfaces/response-handler.interface';
import { jwtVerify } from '../utils/jwt.sign';
import userManager from '../services/user.manager';

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      const response: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.UNAUTHORIZED,
        description: ResponseDescription.UNAUTHORIZED,
        data: null,
      };
      return res.status(ResponseCode.UNAUTHORIZED).json(response);
    }
    const decoded: any = await jwtVerify(token, false);
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


        
   