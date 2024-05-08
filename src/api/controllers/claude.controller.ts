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

// export interface IClaudeChats {
//   _id?: string;
//   prompt?: string;
//   chatsData: {
//     _id: string;
//     ai_response: string;
//     answered: boolean;
//     answer: string;
//   }[];
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// import { Types } from "mongoose";
// import { IClaudeChats } from "./claude.chats.interface";
// export interface IClaude {
//   _id?: string;
//   user: Types.ObjectId;
//   chats: IClaudeChats[];
//   createdAt?: Date;
//   updatedAt?: Date;
// }

import claudeManager from "../../services/claude.manager";
import { IClaude } from "../../interfaces/claude/claude.interface";
import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { claudeResponseData } from "../../utils/userResponse/claude-response.utils";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import mongoose from "mongoose";
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_SECRET,
});

export class ClaudeController {
  private static instance: ClaudeController;

  // private constructor() {}

  public static getInstance(): ClaudeController {
    if (!ClaudeController.instance) {
      ClaudeController.instance = new ClaudeController();
    }

    return ClaudeController.instance;
  }

  public async create(req: any, res: Response) {
    try {
      console.log("Hello, Claude, console.log");
      const user: any = req.user;
      console.log("Hello, Claude, console.log", user);

      if (user) {
        const initialPrompt = `I am Claude, an AI assistant. I have been provided with the following information about an NFT marketplace platform:

        The platform is an NFT (Non-Fungible Token) marketplace where users can buy, sell, and trade unique digital assets called NFTs. These NFTs can represent various digital items such as artwork, collectibles, virtual real estate, and more.
        
        The platform utilizes blockchain technology to ensure the authenticity, ownership, and provenance of the NFTs. Users can connect their cryptocurrency wallets to the platform and make transactions using various cryptocurrencies like Ethereum, Bitcoin, and others.
        
        Here are some additional details about the users and their activities on the platform:
        
        - User rahul (Wallet Address: k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a): Recently purchased an NFT artwork for 2.5 KDA.
        - User rahul (Wallet Address: k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a): Listed an NFT for sale at a fixed price of 10 KDA.
        - User rahul (Wallet Address: k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a): Placed a bid of 0.5 KDA on an NFT auction.
        
        With this information in mind, I would like to ask you some questions to better understand the platform and its functionalities. Please feel free to provide any additional context or clarification if needed.
        
        Greet users first and then ask the following questions:
        
        1. How can i help you today?
        
        then wait for the user to respond. Once the user responds, you can continue the conversation based on their input.
        
        `;

        const msg = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          messages: [{ role: "user", content: initialPrompt }],
        });

        console.log(msg);

        const responseData = {
          status: ResponseStatus.CREATED,
          message: ResponseMessage.CREATED,
          description: ResponseDescription.CREATED,
          data: msg,
        };
        return res.status(ResponseCode.CREATED).json(responseData);
      } else {
        const initialPrompt = `I am , an AI assistant. I have been provided with the following information about an NFT marketplace platform:

      The platform is an NFT (Non-Fungible Token) marketplace where users can buy, sell, and trade unique digital assets called NFTs. These NFTs can represent various digital items such as artwork, collectibles, virtual real estate, and more.
      
      The platform utilizes blockchain technology to ensure the authenticity, ownership, and provenance of the NFTs. Users can connect their cryptocurrency wallets to the platform and make transactions using various cryptocurrencies like Ethereum, Bitcoin, and others.
      
      Here are some additional details about the users and their activities on the platform:
      
      - User rahul (Wallet Address: k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a): Recently purchased an NFT artwork for 2.5 KDA.
      - User rahul (Wallet Address: k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a): Listed an NFT for sale at a fixed price of 10 KDA.
      - User rahul (Wallet Address: k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a): Placed a bid of 0.5 KDA on an NFT auction.
      
      With this information in mind, I would like to ask you some questions to better understand the platform and its functionalities. Please feel free to provide any additional context or clarification if needed.
      
      Greet users first and then ask the following questions:

      1. How can i help you today?

      then wait for the user to respond. Once the user responds, you can continue the conversation based on their input.
      
      `;

        const msg = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          messages: [{ role: "user", content: initialPrompt }],
        });

        console.log(msg);

        // const newClaude: IClaude = {
        //   user: new mongoose.Types.ObjectId(_id),
        //   chats: [
        //     {
        //       prompt: initialPrompt,
        //       chatsData: [
        //         {
        //           _id: msg.id,
        //           ai_response: msg.choices[0].message.content,
        //           answered: false,
        //           answer: "",
        //         },
        //       ],
        //     },
        //   ],
        // };

        const responseData: IResponseHandler = {
          status: ResponseStatus.CREATED,
          message: ResponseMessage.CREATED,
          description: ResponseDescription.CREATED,
          data: msg,
        };
        return res.status(ResponseCode.CREATED).json(responseData);
      }
    } catch (error) {
      console.log("Error: ", error);
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: error,
      };
      return res.status(ResponseCode.FAILED).json(responseData);
    }
  }

  public async chat(req: any, res: Response) {
    try {
      const { message, id } = req.body;
      console.log("Hello, Claude, console.log", message, id);

      if (message === "") {
        const responseData = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: "Message cannot be empty",
        };
        return res.status(ResponseCode.FAILED).json(responseData);
      }

      const msg = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [{ role: "user", content: message }],
      });

      console.log(msg);

      const responseData = {
        status: ResponseStatus.CREATED,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: msg,
      };
      return res.status(ResponseCode.CREATED).json(responseData);
    } catch (error) {
      console.log("Error: ", error);
      const responseData = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: error,
      };
      return res.status(ResponseCode.FAILED).json(responseData);
    }
  }



}

export default ClaudeController.getInstance();
