import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import * as middlewares from "./middlewares/response-handler.middleware";
import api from "./api";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { options } from "./swagger";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./mail/transporter.mail");
import { userResponseData } from "./utils/userResponse/user-response.utils";
import { IResponseHandler } from "./interfaces/response-handler.interface";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "./enum/response-message.enum";
import { jwtSign } from "./utils/jwt.sign";
import { IUser } from "./interfaces/user/user.interface";

// const data = userResponseData(user);
//       const response: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         description: ResponseDescription.SUCCESS,
//         data: data,
//       };
//       res.status(ResponseCode.SUCCESS).json(response);

const app = express();

// Define an array of allowed origins (domains)
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:3000",
  "http://localhost:3001",
];

// Configure CORS options
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin || "") !== -1 || !origin) {
      // Allow the request if the origin is in the allowedOrigins array or if it's not provided (e.g., same-origin requests)
      callback(null, true);
    } else {
      // Deny the request if the origin is not in the allowedOrigins array
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Enable CORS
app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(session({ secret: "cats" }));
app.use(
  session({
    secret: "test123",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//passport configuration
require("./config/passport");

// Swagger Configuration
const specs = swaggerJsDoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/auth/failure",
  })
);

app.get("/check-session", (req, res) => {
  console.log("Session--------------------------------------:");
  console.log("Session:", req.user);
  if (req.user) {
    res.status(200).send({ message: "User is logged in" });
  } else {
  }
});

app.get("/api/v1/auth/login/success", (req: any, res: any) => {
  console.log("Login Success");
  console.log(req.user);
  if (req.user) {
    const user: IUser = req.user.data;
    const data = userResponseData(user);
    const token = jwtSign(user);
    const response: IResponseHandler = {
      status: ResponseStatus.SUCCESS,
      message: ResponseMessage.SUCCESS,
      description: ResponseDescription.SUCCESS,
      data: data,
      token: token,
    };
    res.status(ResponseCode.SUCCESS).json(response);
  }
});

app.get("/api/v1/logout", (req, res) => {
  // res.status(200).send({ message: "Logout Successfully" });
  req.logout((err) => {
    console.log("Logout");
    if (err) {
      console.error("Error during logout:", err);
    }
    res.clearCookie("connect.sid", { path: "/", httpOnly: true });
    res.status(200).send({ message: "Logout Successfully" });
  });
});

// Routes
app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
