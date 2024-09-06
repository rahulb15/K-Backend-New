import app from "./app";
import connectToDatabase from "./config/db.config";
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketIOServer } from "./helpers/websocket-server";
import { initializeNotificationSystem } from "./services/notification.manager";
import { initializeChatSystem } from './services/chat.manager';

const port = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      return process.env.PORT_PROD || 5000;
    case "test":
      return process.env.PORT_TEST || 5000;
    default:
      return process.env.PORT_DEV || 5000;
  }
};

// Initialize the HTTP server
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3001",
  "https://kryptomerchadmin.app.runonflux.io"
];

const io: any = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// const io:any = new SocketIOServer(server, {
//   cors: {
//     origin: process.env.CLIENT_URL,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     credentials: true
//   }
// });

setupSocketIOServer(io);
(global as any).io = io;

// Connect to the database
connectToDatabase()
  .then(() => {
    console.log("Database connected successfully");
    // Start the notification system
    initializeNotificationSystem()
      .then(() => {
        console.log("Notification system initialized successfully");
      })
      .catch((error) => {
        console.error("Error initializing notification system:", error);
        process.exit(1);
      });

    // Start the chat system
    initializeChatSystem()
      .then(() => {
        console.log("Chat system initialized successfully");
      })
      .catch((error) => {
        console.error("Error initializing chat system:", error);
        process.exit(1);
      });
      

    // Start the server after successful database connection
    server.listen(port(), () => {
      /* eslint-disable no-console */
      console.log(`Listening: http://localhost:${port()}`);
      /* eslint-enable no-console */
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });
