const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
import { jwtSign, jwtVerify } from "../utils/jwt.sign";
import userManager from "../services/user.manager";
import { userResponseData } from "../utils/userResponse/user-response.utils";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../enum/response-message.enum";
import { IUser } from "../interfaces/user/user.interface";
passport.serializeUser(function (user: any, done: any) {
  console.log("User:fffffffff", user);
  done(null, user);
});

passport.deserializeUser(function (user: any, done: any) {
  console.log("User:fffffffff", user);
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
      console.log("Profile:", profile);
 

      const user: IUser = {
        email: profile.emails[0].value,
        name: profile.displayName,
      };
      console.log("User:", user);

      async function updateUser(user: IUser) {
        //check if user already exists in our db with the same email if not, create a new user
        const existingUser: IUser = await userManager.getByEmail(user.email);
        if (!existingUser) {
          const newUser: IUser = await userManager.create(user);
          const token = jwtSign(newUser);
          const data = userResponseData(newUser);
          const response = {
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.CREATED,
            description: ResponseDescription.CREATED,
            data: data,
            token: token,
          };
          return done(null, response);
        } else {
          const token = jwtSign(existingUser);
          const data = userResponseData(existingUser);
          const response = {
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.SUCCESS,
            description: ResponseDescription.SUCCESS,
            data: data,
            token: token,
          };
          return done(null, response);
        }
      }
      updateUser(user);
    }
  )
);

export default passport;
