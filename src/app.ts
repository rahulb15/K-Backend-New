import cors, { CorsOptions } from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import api from "./api";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "./enum/response-message.enum";
import { IResponseHandler } from "./interfaces/response-handler.interface";
import { IUser } from "./interfaces/user/user.interface";
import * as middlewares from "./middlewares/response-handler.middleware";
import { options } from "./swagger";
import { jwtSign } from "./utils/jwt.sign";
import { userResponseData } from "./utils/userResponse/user-response.utils";
import { v4 as uuidv4 } from "uuid";
import {
  sendNotification,
  startNotificationConsumer,
} from "./services/notification.manager";

const salesRoutes = require("./marmalade/routes/salesRoutes.js");
const collectionRoutes = require("./marmalade/routes/collectionRoutes.js");
const {
  MarmaladeNGClient,
  set_client,
} = require("./marmalade/chainweb_marmalade_ng.js");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./mail/transporter.mail");
require("./marmalade/services/cron-job/cron-job");
import RarityCalculationService from "./services/rarityCalculationService";
const rarityService = RarityCalculationService.getInstance();
rarityService.scheduleRarityCalculation();
import { setupRealTimeSync } from "./config/elasticsearchSync";
setupRealTimeSync();

// Initialize the MarmaladeNGClient Testnet
// const client = new MarmaladeNGClient(
//   "Testnet Chain 1",
//   "https://api.testnet.chainweb.com",
//   "testnet04",
//   "1",
//   "n_442d3e11cfe0d39859878e5b1520cd8b8c36e5db",
//   "n_a55cdf159bc9fda0a8af03a71bb046942b1e4faf"
// );
// set_client(client);


// Initialize the MarmaladeNGClient Mainnet
const client = new MarmaladeNGClient(
  "Mainnet Chain 8",
  "https://api.chainweb.com",
  "mainnet01",
  "8",
  "n_4e470a97222514a8662dd1219000a0431451b0ee",
  "n_4e470b4e150fafd1c50d1f016331142b55dd01db"
);
set_client(client);




const app = express();

// Define an array of allowed origins (domains)
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://kryptomerchadmin.app.runonflux.io",
  "https://kryptomerchfrontend.app.runonflux.io"
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

// Enable CORS, morgan, and helmet
app.use(morgan("dev"));
app.use(helmet());
app.use(cors(corsOptions));  // Use the custom corsOptions here

app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
// app.use(session({ secret: "cats" }));
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
    successRedirect: `${process.env.CLIENT_URL}/`,
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

// app.get("/api/v1/logout", (req, res) => {
//   // res.status(200).send({ message: "Logout Successfully" });
//   req.logout((err) => {
//     console.log("Logout");
//     if (err) {
//       console.error("Error during logout:", err);
//     }
//     res.clearCookie("connect.sid", { path: "/", httpOnly: true });
//     res.status(200).send({ message: "Logout Successfully" });
//   });
// });
app.get("/api/v1/logout", (req: any, res: express.Response) => {
  req.logout((err: any) => {
      if (err) {
          console.error("Error during logout:", err);
          return res.status(500).send({ message: "Logout failed" });
      }

      req.session.destroy((err: any) => {
          if (err) {
              console.error("Session destruction failed:", err);
              return res.status(500).send({ message: "Session destruction failed" });
          }
          console.log("Session destroyed--------------------------------------:");
          res.clearCookie("connect.sid", { path: "/", httpOnly: true });
          res.status(200).send({ message: "Logout Successfully" });
      });
  });
});




app.post('/api/notifications', async (req, res) => {
  try {
    const testNotification = {
      id: `test-${Date.now()}`,
      userId: req.body.userId,
      message: 'This is a test notification',
      createdAt: new Date()
    };
    console.log('Sending test notification:', testNotification);
    
    await sendNotification(testNotification);
    res.status(200).json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Routes
app.use("/api/v1", api);

// app.use(express.json());

//MarmaledNG Routes
app.use("/api/v1/marmalade/sales", salesRoutes);
app.use("/api/v1/marmalade/collections", collectionRoutes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
