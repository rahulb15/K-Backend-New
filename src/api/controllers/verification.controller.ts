import axios from "axios";
import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { IUser } from "../../interfaces/user/user.interface";
import { IVerification } from "../../interfaces/verification/verification.interface";
import userManager from "../../services/user.manager";
import { VerificationManager } from "../../services/verification.manager";
import { verificationResponseData } from "../../utils/userResponse/verification-response.utils";

const crypto = require("crypto");
const fs = require("fs");
const FormData = require("form-data");

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN as string;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY as string;
const SUMSUB_BASE_URL = "https://api.sumsub.com";

const config = {
  baseURL: SUMSUB_BASE_URL,
};

// axios.interceptors.request.use(createSignature, function (error) {
//   return Promise.reject(error);
// });

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
      axios.interceptors.request.use(createSignature, function (error) {
        return Promise.reject(error);
      });
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
