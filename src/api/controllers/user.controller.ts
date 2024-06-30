import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { IUser } from "../../interfaces/user/user.interface";
import { sendForgetPasswordMail } from "../../mail/forgetPassword.mail";
import userManager from "../../services/user.manager";
import { UserPointsManager } from "../../services/userpoints.manager";
import { comparePassword, hashPassword } from "../../utils/hash.password";
import { jwtSign, jwtVerify } from "../../utils/jwt.sign";
import {
  userResponseData,
  userResponseDataForAdmin,
  userResponseDataForProfile,
} from "../../utils/userResponse/user-response.utils";
import {
  emailValidator,
  nameValidator,
  passwordValidator,
} from "../../utils/validator.util";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import moment from "moment";
import qrcode from "qrcode";
import speakeasy from "speakeasy";
import cloudinary from "../../config/cloudinary.config";
import { newUserEmail } from "../../mail/newUserEmail";

export class UserController {
  /*
   * @creator: rahul baghel
   * @desc Create a new user
   * @route POST /api/v1/user
   * @access Public
   * */
  public async create(req: Request, res: Response) {
    try {
      const user: IUser = req.body;

      //validate email
      const isEmailValid = emailValidator(user.email);
      if (!isEmailValid) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.EMAIL_INVALID,
          description: ResponseDescription.EMAIL_INVALID,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      //validate name
      // const isNameValid = nameValidator(user.name);
      if (user.name.length < 3) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.NAME_INVALID,
          description: ResponseDescription.NAME_INVALID,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      const existingUser = await userManager.getByEmail(user.email);
      if (existingUser) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.CONFLICT,
          description: ResponseDescription.CONFLICT,
          data: null,
        };

        return res.status(ResponseCode.SUCCESS).json(response);
      }

      // console.log(user, "user");
      // Generate walletaddress
      const generateWalletAddress = (userData: any) => {
        const userDataString = JSON.stringify(userData);
        const hash = crypto
          .createHash("sha256")
          .update(userDataString)
          .digest("hex");
        return `u:${hash}`;
      };

      const newUser: IUser = {
        ...user,
        walletAddress: generateWalletAddress(user),
      };

      console.log(newUser, "user");

      const createdUser = await userManager.create(newUser);
      const token = jwtSign(createdUser);
      const data = userResponseData(createdUser);

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: data,
        token: token,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  //create with waletaddress
  public async createWithWalletAddress(req: Request, res: Response) {
    try {
      const user: IUser = req.body;

      //validate email
      const isEmailValid = emailValidator(user.email);
      if (!isEmailValid) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.EMAIL_INVALID,
          description: ResponseDescription.EMAIL_INVALID,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      //validate name
      const isNameValid = nameValidator(user.name);
      if (!isNameValid) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.NAME_INVALID,
          description: ResponseDescription.NAME_INVALID,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      const existingUser = await userManager.getByEmail(user.email);
      if (existingUser) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.CONFLICT,
          description: ResponseDescription.CONFLICT,
          data: null,
        };

        return res.status(ResponseCode.SUCCESS).json(response);
      }

      console.log(user, "user");

      if (!user.password) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.PASSWORD_INVALID,
          description: ResponseDescription.PASSWORD_INVALID,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      if (!user.walletAddress) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      //password
      const hashedPassword = await hashPassword(user.password as string);
      user.password = hashedPassword;
      const walletAddress = user.walletAddress as string;
      const existingUserByWalletAddress = await userManager.getByWalletAddress(
        walletAddress
      );
      if (existingUserByWalletAddress) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.CONFLICT,
          description: ResponseDescription.CONFLICT,
          data: null,
        };

        return res.status(ResponseCode.SUCCESS).json(response);
      }

      user.isWalletConnected = true;

      console.log(user, "user------------------------");

      const newUser = await userManager.create(user);
      const token = jwtSign(newUser);
      const data = userResponseData(newUser);

      //mail
      await newUserEmail(newUser, token);

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: data,
        token: token,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Login user
   * @route POST /api/v1/user/login
   * @access Public
   * */
  public async login(req: Request, res: Response) {
    try {
      const user: IUser = req.body;
      //validate email
      const isEmailValid = emailValidator(user.email);
      if (!isEmailValid) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.EMAIL_INVALID,
          description: ResponseDescription.EMAIL_INVALID,
          data: null,
        };

        return res.status(ResponseCode.SUCCESS).json(response);
      }
      //validate password
      // const isPasswordValid = passwordValidator(user.password as string);
      // if (!isPasswordValid) {
      //   const response: IResponseHandler = {
      //     status: ResponseStatus.FAILED,
      //     message: ResponseMessage.PASSWORD_INVALID,
      //     description: ResponseDescription.PASSWORD_INVALID,
      //     data: null,
      //   };

      //   return res.status(ResponseCode.SUCCESS).json(response);
      // }

      const existingUser = await userManager.getByEmail(user.email);
      if (!existingUser) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.SUCCESS).json(response);
      }

      //check password
      const isPasswordMatch = await comparePassword(
        user.password as string,
        existingUser.password as string
      );
      if (!isPasswordMatch) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.PASSWORD_NOT_MATCH,
          description: ResponseDescription.PASSWORD_NOT_MATCH,
          data: null,
        };

        return res.status(ResponseCode.SUCCESS).json(response);
      }

      const token = jwtSign(existingUser, true);
      const data = userResponseDataForAdmin(existingUser);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: data,
        token: token,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.log(error);

      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Logout user
   * @route POST /api/v1/user/logout
   * @access Private
   * */
  public async logout(req: Request, res: Response) {
    try {
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: null,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Get all users
   * @route GET /api/v1/user
   * @access Private
   * */
  public async getAll(req: Request, res: Response) {
    try {
      // // redis cache
      // const cacheValue = await client.get('users');
      // console.log(cacheValue, 'cacheValue');
      // if (cacheValue) {
      //   const response: IResponseHandler = {
      //     status: ResponseStatus.SUCCESS,
      //     message: ResponseMessage.SUCCESS,
      //     description: ResponseDescription.SUCCESS,
      //     data: JSON.parse(cacheValue),
      //   };
      //   return res.status(ResponseCode.SUCCESS).json(response);
      // }

      const users = await userManager.getAll();
      const data = users.map((user) => userResponseData(user));
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: data,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Get user by id
   * @route GET /api/v1/user/:id
   * @access Private
   * */
  public async getById(req: Request, res: Response) {
    try {
      const user = await userManager.getById(req.params.id);
      const data = userResponseDataForProfile(user);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: data,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Get user by id
   * @route GET /api/v1/user/:id
   * @access Private
   * */
  public async getUserDetail(req: any, res: Response) {
    try {
      const user = await userManager.getById(req.user._id);
      const data = userResponseDataForProfile(user);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: data,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Update user by id
   * @route PUT /api/v1/user/:id
   * @access Private
   * */
  public async updateById(req: any, res: Response) {
    try {
      const user: IUser = req.body;
      const userId = req.user._id;

      const existingUser = await userManager.getById(userId);
      if (!existingUser) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      if (user.email) {
        const isEmailValid = emailValidator(user.email);
        if (!isEmailValid) {
          const response: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.EMAIL_INVALID,
            description: ResponseDescription.EMAIL_INVALID,
            data: null,
          };

          return res.status(ResponseCode.BAD_REQUEST).json(response);
        }
        if (user.email !== existingUser.email) {
          const existingUserByEmail = await userManager.getByEmail(user.email);
          if (existingUserByEmail) {
            const response: IResponseHandler = {
              status: ResponseStatus.FAILED,
              message: ResponseMessage.EMAIL_NOT_MATCH,
              description: ResponseDescription.EMAIL_NOT_MATCH,
              data: null,
            };

            return res.status(ResponseCode.BAD_REQUEST).json(response);
          }
        }
      }

      const updatedUser = await userManager.updateById(userId, user);
      const data = userResponseData(updatedUser);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: data,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Delete user by id
   * @route DELETE /api/v1/user/:id
   * @access Private
   * */
  public async deleteById(req: Request, res: Response) {
    try {
      const existingUser = await userManager.getById(req.params.id);
      if (!existingUser) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }
      await userManager.deleteById(req.params.id);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: null,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Forgot password
   * @route POST /api/v1/user/forgot-password
   * @access Public
   * */
  public async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await userManager.getByEmail(email);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }
      const token = jwtSign(user);
      const data = {
        token: token,
        email: user.email,
      };
      // send email
      await sendForgetPasswordMail(user, token);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: data,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Reset password
   * @route POST /api/v1/user/reset-password
   * @access Public
   * */
  public async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      const decoded: any = jwtVerify(token);
      const user = await userManager.getById(decoded.id);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }
      const isPasswordValid = passwordValidator(password);
      if (!isPasswordValid) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.PASSWORD_INVALID,
          description: ResponseDescription.PASSWORD_INVALID,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      await userManager.updateById(decoded.id, user);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: null,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  //verify Email
  public async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const decoded: any = jwtVerify(token);
      const user = await userManager.getById(decoded.id);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }
      user.isEmailVerified = true;
      await userManager.updateById(decoded.id, user);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: null,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /*
   * @creator: rahul baghel
   * @desc Get user by wallet address
   * @route GET /api/v1/user/wallet/:walletAddress
   * @access Private
   * */
  public async getByWalletAddress(req: Request, res: Response) {
    try {
      console.log(req.params.walletAddress, "req.params.walletAddress");
      const user: any = await userManager.getByWalletAddress(
        req.params.walletAddress
      );

      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.SUCCESS).json(response);
      }
      const token = jwtSign(user);
      const data = userResponseData(user);
      console.log(data, "data");

      const userPoints: any = await UserPointsManager.getInstance().getByUserId(
        user._id
      );
      console.log(userPoints, "userPoints===============");
      // activityLog: [
      //   {
      //     type: 'Login',
      //     pointsEarned: 1,
      //     _id: new ObjectId('661fbc0d0b7da3b58a91337c'),
      //     createdAt: 2024-04-18T12:09:49.594Z
      //   }
      // ],

      //find type Login in activityLog and if found then update the pointsEarned and totalPoints

      //find
      userPoints.activityLog.forEach((element: any) => {
        if (element.type === "Login") {
          //check date if today then do not update
          const today = new Date();
          const lastActivityLogDate = new Date(element.createdAt);
          // if (today.getDate() !== lastActivityLogDate.getDate()) {
          //   element.pointsEarned += 1;
          //   userPoints.totalPoints += 1;
          //   element.createdAt = new Date();
          // }

          console.log(
            moment(today).diff(lastActivityLogDate, "days"),
            "moment(today).diff(lastActivityLogDate, 'days')"
          );

          //check if user skip a day login then reset the pointsEarned to 1 and if user login again then increment the pointsEarned but increment only one for same day as compare to yesterday day not day before yesterday
          if (moment(today).diff(lastActivityLogDate, "days") === 1) {
            element.pointsEarned += 1;
            element.createdAt = new Date();
          } else if (moment(today).diff(lastActivityLogDate, "days") > 1) {
            element.pointsEarned = 1;
            element.createdAt = new Date();
          }
        }
      });

      console.log(userPoints, "userPoints===============463");
      await UserPointsManager.getInstance().updateById(user._id, userPoints);

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: data,
        token: token,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  // check email exist or not
  public async checkEmail(req: Request, res: Response) {
    try {
      console.log(req.body, "req.body");
      const { email } = req.body;
      console.log(email, "email");
      const user = await userManager.getByEmail(email);
      console.log(user, "user");
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.SUCCESS).json(response);
      }

      //check user have password or not
      if (!user.password) {
        console.log("Hello");
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: {
            isSocialLogin: true,
          },
        };

        console.log(response, "response");

        res.status(ResponseCode.SUCCESS).json(response);
      } else {
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: null,
        };
        res.status(ResponseCode.SUCCESS).json(response);
      }
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  public async enableTwoFactorAuth(req: any, res: Response) {
    try {
      const userId = req.user._id;

      //update user
      const user = await userManager.getById(userId);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      let qrCodeUrl = "";

      if (user.is2FAEnabled && user.secret2FA && user.is2FAVerified) {
        qrCodeUrl = await qrcode.toDataURL(user.secret2FA as string);
        //success
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: {
            secret: user.secret2FA,
            qrCodeUrl: "",
          },
        };
        return res.status(ResponseCode.SUCCESS).json(response);
      } else {
        const secret: any = speakeasy.generateSecret({
          length: 20,
          name: "Kryptomerch",
          issuer: "Kryptomerch",
        });
        qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        user.secret2FA = secret.base32;
        user.is2FAEnabled = true;
        await userManager.updateById(userId, user);

        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: {
            secret: secret.base32,
            qrCodeUrl: qrCodeUrl,
          },
        };
        res.status(ResponseCode.SUCCESS).json(response);
      }
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  public async verifyTwoFactorAuth(req: any, res: Response) {
    try {
      const { token, secret } = req.body;
      console.log(token, "token", secret, "secret");
      const userId = req.user._id;
      console.log(userId, "userId");
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
      });

      console.log(verified, "verified");

      if (!verified) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      const user = await userManager.getById(userId);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      user.is2FAVerified = true;
      await userManager.updateById(userId, user);

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: null,
      };

      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  public async disableTwoFactorAuth(req: Request, res: Response) {
    try {
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: null,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  public async uploadImage(req: any, res: Response) {
    try {
      console.log("Hello", req.files);
      console.log(req.files.profile, "req.file");
      if (!req.files) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      const userId = req.user._id;
      const user: IUser = await userManager.getById(userId);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      const profile = req.files.profileImage;
      const cover = req.files.coverImage;

      if (profile) {
        cloudinary.uploader.upload(
          profile[0].path,
          {
            folder: "profile",
            use_filename: true,
            unique_filename: false,
          },
          async (error: any, result: any) => {
            if (error) {
              console.log(error, "error");
            }
            console.log(result, "result");
            user.profileImage = result.secure_url;
            const updated = await userManager.updateById(userId, user);
            const response: IResponseHandler = {
              status: ResponseStatus.SUCCESS,
              message: ResponseMessage.SUCCESS,
              description: ResponseDescription.SUCCESS,
              data: updated,
            };
            res.status(ResponseCode.SUCCESS).json(response);
          }
        );
      } else {
        cloudinary.uploader.upload(
          cover[0].path,
          {
            folder: "cover",
            use_filename: true,
            unique_filename: false,
          },
          async (error: any, result: any) => {
            if (error) {
              console.log(error, "error");
            }
            console.log(result, "result");
            user.coverImage = result.secure_url;
            const updated = await userManager.updateById(userId, user);
            const response: IResponseHandler = {
              status: ResponseStatus.SUCCESS,
              message: ResponseMessage.SUCCESS,
              description: ResponseDescription.SUCCESS,
              data: updated,
            };
            res.status(ResponseCode.SUCCESS).json(response);
          }
        );
      }
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  // get all users with pagination and search using aggregation
  public async getAllUsersWithPagination(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        search,
      }: { page: number; limit: number; search: string } = req.body;
      const users = await userManager.getAllUsersWithPagination(
        page,
        limit,
        search ? search : ""
      );
      const data = users.map((user) => userResponseDataForAdmin(user));
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: data,
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  // check token is valid or not if valid then return user data else return null
  public async checkToken(req: Request, res: Response) {
    try {
      console.log(req.headers.authorization, "req.headers.authorization");
      const token = req.headers.authorization?.split(" ")[1];
      console.log(token, "token");
      jwt.verify(
        token as string,
        process.env.JWT_USER_SECRET as string,
        async (err: any, decoded: any) => {
          if (err) {
            console.log(err, "err");
            const response: IResponseHandler = {
              status: ResponseStatus.FAILED,
              message: ResponseMessage.FAILED,
              description: ResponseDescription.FAILED,
              data: {
                isTokenValid: false,
              },
            };
            return res.status(ResponseCode.SUCCESS).json(response);
          }

          console.log(decoded, "decoded");
          const user = await userManager.getById(decoded.id);
          console.log(user, "user");

          const response: IResponseHandler = {
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.SUCCESS,
            description: ResponseDescription.SUCCESS,
            data: user,
          };
          return res.status(ResponseCode.SUCCESS).json(response);
        }
      );
    } catch (error) {
      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

export default new UserController();
