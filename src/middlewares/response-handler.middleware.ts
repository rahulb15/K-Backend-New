import { NextFunction, Request, Response } from 'express';
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from '../enum/response-message.enum';

export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(ResponseCode.NOT_FOUND);
  next(error);
}

export function errorHandler(error: any, req: Request, res: Response) {
  const statusCode =
    res.statusCode === ResponseCode.SUCCESS
      ? ResponseCode.INTERNAL_SERVER_ERROR
      : res.statusCode;
  res.status(statusCode);
  res.json({
    status: ResponseStatus.FAILED,
    message: ResponseMessage.FAILED,
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  });
}

// export function successHandler(data: any, req: Request, res: Response, next: NextFunction) {
//     res.status(ResponseCode.SUCCESS);
//     res.json({
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         description: ResponseDescription.SUCCESS,
//         data: data
//     });
// }

// export function createdHandler(data: any, req: Request, res: Response, next: NextFunction) {
//     res.status(ResponseCode.CREATED);
//     res.json({
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.CREATED,
//         description: ResponseDescription.CREATED,
//         data: data
//     });
// }

// export function updatedHandler(data: any, req: Request, res: Response, next: NextFunction) {
//     res.status(ResponseCode.SUCCESS);
//     res.json({
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.UPDATED,
//         description: ResponseDescription.UPDATED,
//         data: data
//     });
// }

// export function deletedHandler(data: any, req: Request, res: Response, next: NextFunction) {
//     res.status(ResponseCode.SUCCESS);
//     res.json({
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.DELETED,
//         description: ResponseDescription.DELETED,
//         data: data
//     });
// }

// export function badRequestHandler(data: any, req: Request, res: Response, next: NextFunction) {
//     res.status(ResponseCode.BAD_REQUEST);
//     res.json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.BAD_REQUEST,
//         data: data
//     });
// }

// export function unauthorizedHandler(data: any, req: Request, res: Response, next: NextFunction) {
//     res.status(ResponseCode.UNAUTHORIZED);
//     res.json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.UNAUTHORIZED,
//         data: data
//     });
// }

// export function forbiddenHandler(data: any, req: Request, res: Response, next: NextFunction) {
//     res.status(ResponseCode.FORBIDDEN);
//     res.json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.FORBIDDEN,
//         data: data
//     });
// }
