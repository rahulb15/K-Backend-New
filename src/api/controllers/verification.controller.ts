// export enum ResponseMessage {
//     SUCCESS = 'Success',
//     FAILED = 'Failed',
//     NOT_FOUND = 'Not Found',
//     UNAUTHORIZED = 'Unauthorized',
//     FORBIDDEN = 'Forbidden',
//     BAD_REQUEST = 'Bad Request',
//     INTERNAL_SERVER_ERROR = 'Internal Server Error',
//     CREATED = 'Created',
//     UPDATED = 'Updated',
//     DELETED = 'Deleted',
//     DUPLICATE = 'Duplicate',
//     INVALID = 'Invalid',
//     EXPIRED = 'Expired',
//     CONFLICT = 'Conflict',
//     UserLoggedIn = 'User logged in',
//     EMAIL_INVALID = 'Email is invalid',
//     PASSWORD_INVALID = 'Password is invalid',
//     NAME_INVALID = 'Name is invalid',
//     USER_NOT_FOUND = 'User not found',
//     EMAIL_NOT_MATCH = 'Email not match',
//     PASSWORD_MATCH = 'Password not match',
//     NEW_PASSWORD_REQUIRED = 'New password required',
//     EMAIL_NOT_SENT = 'Email not sent',
//   }

//   export enum ResponseDescription {
//     SUCCESS = 'The request has succeeded.',
//     FAILED = 'The request has failed.',
//     NOT_FOUND = 'The requested resource could not be found but may be available in the future.',
//     UNAUTHORIZED = 'The request requires user authentication.',
//     FORBIDDEN = 'The server understood the request but refuses to authorize it.',
//     BAD_REQUEST = 'The server cannot or will not process the request due to an apparent client error.',
//     INTERNAL_SERVER_ERROR = 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
//     CREATED = 'The request has succeeded and a new resource has been created as a result.',
//     UPDATED = 'The request has succeeded and the resource has been updated.',
//     DELETED = 'The request has succeeded and the resource has been deleted.',
//     DUPLICATE = 'The request has failed due to a duplicate resource.',
//     INVALID = 'The request has failed due to an invalid resource.',
//     EXPIRED = 'The request has failed due to an expired resource.',
//     CONFLICT = 'The request has failed due to a conflict resource.',
//     UserNotFound = 'User not found',
//     UserLoggedIn = 'User logged in',
//     EMAIL_INVALID = 'Email is invalid',
//     PASSWORD_INVALID = 'Minimum eight characters, at least one uppercase letter, one lowercase letter and one number',
//     NAME_INVALID = 'Minimum eight characters, at least one uppercase letter, one lowercase letter and one number',
//     USER_NOT_FOUND = 'User not found',
//     EMAIL_NOT_MATCH = 'Please enter valid email',
//     PASSWORD_MATCH = 'Please enter valid password',
//     NEW_PASSWORD_REQUIRED = 'Please enter new password',
//     EMAIL_NOT_SENT = 'Email not sent',
//   }

//   export enum ResponseCode {
//     SUCCESS = 200,
//     FAILED = 400,
//     NOT_FOUND = 404,
//     UNAUTHORIZED = 401,
//     FORBIDDEN = 403,
//     BAD_REQUEST = 400,
//     INTERNAL_SERVER_ERROR = 500,
//     CREATED = 201,
//     UPDATED = 200,
//     DELETED = 200,
//     DUPLICATE = 400,
//     INVALID = 400,
//     EXPIRED = 400,
//     CONFLICT = 409,

//   }

//   export enum ResponseStatus {
//     SUCCESS = 'success',
//     FAILED = 'failed',
//     NOT_FOUND = 'not_found',
//     UNAUTHORIZED = 'unauthorized',
//     FORBIDDEN = 'forbidden',
//     BAD_REQUEST = 'bad_request',
//     INTERNAL_SERVER_ERROR = 'internal_server_error',
//     CREATED = 'created',
//     UPDATED = 'updated',
//     DELETED = 'deleted',
//     DUPLICATE = 'duplicate',
//     INVALID = 'invalid',
//     EXPIRED = 'expired',
//     CONFLICT = 'conflict',

//   }

// import { UserPointsManager } from "../../services/userpoints.manager";
// import { IUserPoints } from "../../interfaces/userpoints/userpoints.interface";
// import { Request, Response } from "express";
// import {
//   ResponseCode,
//   ResponseDescription,
//   ResponseMessage,
//   ResponseStatus,
// } from "../../enum/response-message.enum";
// import { userPointsResponseData } from "../../utils/userResponse/userpoints-response.utils";
// import { IResponseHandler } from "../../interfaces/response-handler.interface";
// import mongoose from "mongoose";

// export interface IResponseHandler {
//     status: ResponseStatus;
//     message: ResponseMessage;
//     description: ResponseDescription;
//     data: any;
//     token?: string;
//   }

// const verificationSchema = new Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   applicantData: { type: Object, required: true },
//   status: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { VerificationManager } from "../../services/verification.manager";
import { IVerification } from "../../interfaces/verification/verification.interface";
import { Request, Response } from "express";
import { verificationResponseData } from "../../utils/userResponse/verification-response.utils";
import axios from "axios";
import userManager from "../../services/user.manager";
import { IUser } from "../../interfaces/user/user.interface";

const crypto = require("crypto");
const fs = require("fs");
const FormData = require("form-data");

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN as string;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY as string;
const SUMSUB_BASE_URL = "https://api.sumsub.com";

const config = {
  baseURL: SUMSUB_BASE_URL,
};

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error);
});

// Function to create the signature
function createSignature(config: any) {
  console.log("Creating a signature for the request...");

  const ts = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac("sha256", SUMSUB_SECRET_KEY);
  signature.update(ts + config.method.toUpperCase() + config.url);

  if (config.data instanceof FormData) {
    signature.update(config.data.getBuffer());
  } else if (config.data) {
    signature.update(config.data);
  }

  config.headers["X-App-Access-Ts"] = ts;
  config.headers["X-App-Access-Sig"] = signature.digest("hex");

  return config;
}

export class VerificationController {
  private static instance: VerificationController;

  public static getInstance(): VerificationController {
    if (!VerificationController.instance) {
      VerificationController.instance = new VerificationController();
    }

    return VerificationController.instance;
  }

  public async createVerification(req: any, res: Response) {
    try {
      const verificationManager = VerificationManager.getInstance();
      const userId = req.user._id;

      //update verified true in user
      const user: IUser = await userManager.getById(userId);
      user.verified = true;
      await userManager.updateById(userId, user);

      const verification: IVerification = {
        user: userId,
        applicantData: req.body.applicantData,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      //if verification already exists, update it
      const existingVerification: IVerification =
        await verificationManager.getByUserId(userId);
      if (existingVerification) {
        await verificationManager.updateById(
          existingVerification._id as string,
          verification
        );
        const responseData = verificationResponseData(verification);
        const response: IResponseHandler = {
          data: responseData,
          message: ResponseMessage.UPDATED,
          description: ResponseDescription.UPDATED,
          status: ResponseStatus.UPDATED,
        };
        return res.status(ResponseCode.UPDATED).json(response);
      }

      const newVerification = await verificationManager.create(verification);
      const responseData = verificationResponseData(newVerification);
      const response: IResponseHandler = {
        data: responseData,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        status: ResponseStatus.CREATED,
      };
      return res.status(ResponseCode.CREATED).json(response);
    } catch (error) {
      const response: IResponseHandler = {
        data: null,
        message: ResponseMessage.FAILED,
        status: ResponseStatus.FAILED,
        description: ResponseDescription.FAILED,
      };
      return res.status(ResponseCode.FAILED).json(response);
    }
  }

  public async getAllVerifications(req: Request, res: Response) {
    try {
      const verificationManager = VerificationManager.getInstance();
      const verifications = await verificationManager.getAll();
      const responseData = verifications.map((verification) =>
        verificationResponseData(verification)
      );
      const response: IResponseHandler = {
        data: responseData,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        status: ResponseStatus.SUCCESS,
      };
      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      const response: IResponseHandler = {
        data: null,
        message: ResponseMessage.FAILED,
        status: ResponseStatus.FAILED,
        description: ResponseDescription.FAILED,
      };
      return res.status(ResponseCode.FAILED).json(response);
    }
  }

  public async getVerificationByUserId(req: Request, res: Response) {
    try {
      const verificationManager = VerificationManager.getInstance();
      const userId = req.params.userId;
      const verification = await verificationManager.getByUserId(userId);
      const responseData = verificationResponseData(verification);
      const response: IResponseHandler = {
        data: responseData,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        status: ResponseStatus.SUCCESS,
      };
      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      const response: IResponseHandler = {
        data: null,
        message: ResponseMessage.FAILED,
        status: ResponseStatus.FAILED,
        description: ResponseDescription.FAILED,
      };
      return res.status(ResponseCode.FAILED).json(response);
    }
  }

  public async getAccessToken(req: any, res: Response) {
    const userId = req.user._id.toString();
    console.log("userId", userId);
    const levelName = process.env.SUMSUB_LEVEL_NAME as string;
    const ttlInSecs = 3600;

    const method = "post";
    const url = `/resources/accessTokens?userId=${encodeURIComponent(
      userId
    )}&ttlInSecs=${ttlInSecs}&levelName=${encodeURIComponent(levelName)}`;
    const headers = {
      Accept: "application/json",
      "X-App-Token": SUMSUB_APP_TOKEN,
    };

    const requestConfig = {
      method,
      url,
      headers,
      ...config,
    };
    try {
      const response = await axios(requestConfig);

      const responseData = response.data;

      const responseHandler: IResponseHandler = {
        data: responseData,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        status: ResponseStatus.SUCCESS,
      };

      return res.status(ResponseCode.SUCCESS).json(responseHandler);
    } catch (error) {
      const response: IResponseHandler = {
        data: error,
        message: ResponseMessage.FAILED,
        status: ResponseStatus.FAILED,
        description: ResponseDescription.FAILED,
      };
      return res.status(ResponseCode.FAILED).json(response);
    }
  }
}

export default VerificationController.getInstance();
