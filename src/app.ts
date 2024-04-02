import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import * as middlewares from "./middlewares/response-handler.middleware";
import api from "./api";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { options } from "./swagger";

require("dotenv").config();

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

app.use(morgan("dev"));
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Swagger Configuration
const specs = swaggerJsDoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

// Routes
app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
