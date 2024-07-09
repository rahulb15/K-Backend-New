const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
import crypto from "crypto";
import {
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../enum/response-message.enum";
import { IUser } from "../interfaces/user/user.interface";
import userManager from "../services/user.manager";
import { userResponseData } from "../utils/userResponse/user-response.utils";
passport.serializeUser(function (user: any, done: any) {
  done(null, user);
});

passport.deserializeUser(function (user: any, done: any) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (
      request: any,
      accessToken: any,
      refreshToken: any,
      profile: any,
      done: any
    ) {
      const user: IUser = {
        email: profile.emails[0].value,
        name: profile.displayName,
        isEmailVerified: true,
        isSocialLogin: true,
        socialLogin: {
          google: profile.id,
        },
      };

      async function updateUser(user: IUser) {
        //check if user already exists in our db with the same email if not, create a new user
        const existingUser: IUser = await userManager.getByEmail(user.email);
        if (!existingUser) {
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
            profileImage: profile.photos[0].value,
          };

          const createUser: IUser = await userManager.create(newUser);
          const data = userResponseData(createUser);
          const response = {
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.CREATED,
            description: ResponseDescription.CREATED,
            data: data,
          };
          return done(null, response);
        } else {
          //update user
          const updatedUser: IUser = await userManager.update(
            existingUser._id as string,
            user
          );

          const data = userResponseData(updatedUser);
          const response = {
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.SUCCESS,
            description: ResponseDescription.SUCCESS,
            data: data,
          };
          return done(null, response);
        }
      }
      updateUser(user);
    }
  )
);

export default passport;
