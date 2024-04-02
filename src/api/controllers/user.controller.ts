import userManager from '../../services/user.manager';
import { IUser } from '../../interfaces/user/user.interface';
import { Request, Response } from 'express';
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from '../../enum/response-message.enum';
import { userResponseData } from '../../utils/userResponse/user-response.utils';
import { jwtSign, jwtVerify } from '../../utils/jwt.sign';
import { hashPassword, comparePassword } from '../../utils/hash.password';
import { IResponseHandler } from '../../interfaces/response-handler.interface';
import {
  emailValidator,
  passwordValidator,
  nameValidator,
} from '../../utils/validator.util';
import { sendForgetPasswordMail } from '../../mail/forgetPassword.mail';

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
      //validate password
      const isPasswordValid = passwordValidator(user.password);
      if (!isPasswordValid) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.PASSWORD_INVALID,
          description: ResponseDescription.PASSWORD_INVALID,
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

        return res.status(ResponseCode.CONFLICT).json(response);
      }

      const salt = await hashPassword(user.password);
      user.password = salt;
      const newUser = await userManager.create(user);
      const token = jwtSign(newUser);
      const data = userResponseData(newUser);

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

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }
      //validate password
      const isPasswordValid = passwordValidator(user.password);
      if (!isPasswordValid) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.PASSWORD_INVALID,
          description: ResponseDescription.PASSWORD_INVALID,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      const existingUser = await userManager.getByEmail(user.email);
      if (!existingUser) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }
      const isMatch = await comparePassword(
        user.password,
        existingUser.password,
      );
      if (!isMatch) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.UNAUTHORIZED,
          description: ResponseDescription.UNAUTHORIZED,
          data: null,
        };

        return res.status(ResponseCode.UNAUTHORIZED).json(response);
      }
      const token = jwtSign(existingUser);
      const data = userResponseData(existingUser);
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
      const data = userResponseData(user);
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
  public async updateById(req: Request, res: Response) {
    try {
      const user: IUser = req.body;
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

      if (user.password) {
        const isPasswordValid = passwordValidator(user.password);
        if (!isPasswordValid) {
          const response: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.PASSWORD_INVALID,
            description: ResponseDescription.PASSWORD_INVALID,
            data: null,
          };

          return res.status(ResponseCode.BAD_REQUEST).json(response);
        }

        const isMatch = await comparePassword(
          user.password,
          existingUser.password,
        );
        if (!isMatch) {
          const response: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.PASSWORD_MATCH,
            description: ResponseDescription.PASSWORD_MATCH,
            data: null,
          };

          return res.status(ResponseCode.BAD_REQUEST).json(response);
        }
        if (req.body.newPassword) {
          const hashedPassword = await hashPassword(req.body.newPassword);
          user.password = hashedPassword;
        } else {
          const response: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.NEW_PASSWORD_REQUIRED,
            description: ResponseDescription.NEW_PASSWORD_REQUIRED,
            data: null,
          };

          return res.status(ResponseCode.BAD_REQUEST).json(response);
        }
      }

      const updatedUser = await userManager.updateById(req.params.id, user);
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
      const hashedPassword = await hashPassword(password);
      user.password = hashedPassword;
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
}

export default new UserController();
