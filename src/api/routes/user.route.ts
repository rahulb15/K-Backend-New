import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import upload from "../../middlewares/multer.middleware";
import userController from "../controllers/user.controller";
import fileUpload from 'express-fileupload';

const router = Router();

// const storage = multer.memoryStorage();

// const fileFilter = (req: any, file: any, cb: any) => {
//   // Filtering based on file extension
//   if (
//     file.mimetype === "image/jpeg" ||
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/gif"
//   ) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Invalid file type, only JPEG, PNG, and GIF files are allowed!"
//       ),
//       false
//     );
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 1024 * 1024 * 50, // 50 MB file size limit
//   },
// }).fields([
//   { name: "profileImage", maxCount: 1 },
//   { name: "coverImage", maxCount: 1 },
// ]);

/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: Authentication endpoint
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    User-Signup:
 *       type: object
 *       required:
 *          -name
 *          -email
 *          -password
 *       properties:
 *          name:
 *              type: string
 *              description: the user name
 *          email:
 *              type: string
 *              description: the user email is the format used to identify the username and will be used to send email messages
 *          password:
 *              type: string
 *              description: the user password that will be used to loging to the network
 *       example:
 *          name: rahul
 *          email: rahul@yopmail.com
 *          password: Rahulbaghel1
 *    User:
 *       type: object
 *       required:
 *          -name
 *          -email
 *          -password
 *       properties:
 *          name:
 *             type: string
 *             description: the user name
 *          email:
 *              type: string
 *              description: the user email is the format used to identify the username and will be used to send email messages
 *          password:
 *              type: string
 *              description: the user password that will be used to loging to the network
 *       example:
 *          name: rahul
 *          email: rahul@yopmail.com
 *          password: Rahulbaghel1
 */

/**
 * @swagger
 * /api/v1/user/login:
 *  post:
 *   summary: Login to the system
 *   tags: [Authentication]
 *   requestBody:
 *     required: true
 *     content:
 *        application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *   responses:
 *      200:
 *        description: Login Successfull
 *        content:
 *          application/json:
 *              schema:
 *               type: object
 *               items:
 *                name:
 *                 type: string
 *                email:
 *                 type: string
 *                createdAt:
 *                 type: string
 *                 format: date-time
 *                token:
 *                 type: string
 *               example:
 *                 status: success
 *                 message: Success
 *                 description: The request has succeeded.
 *                 data:
 *                  _id: 647b4eaf037c328ed479c1d9
 *                  name: rahul
 *                  email: rahu@yopmail.com
 *                  createdAt: 2021-12-06T10:52:59.939Z
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiUHJvdmlkZXIiLCJfaWQiOiI2MWFkZWI4YjUzMjBkNDQ0YzlkMzA3MTAiLCJlbWFpbCI6IlNpZW1lbnNAUHJvdmlkZXJzLm9yZyIsIm9yZ25hbWUiOiJPcmcxIiwiY3JlYXRlZEF0IjoiMjAyMS0xMi0wNlQxMDo1Mjo1OS45MzlaIiwidXBkYXRlZEF0IjoiMjAyMS0xMi0wNlQxMDo1Mjo1OS45MzlaIiwiX192IjowLCJpYXQiOjE2NDMwMjcxNDgsImV4cCI6MTY0MzExMzU0OH0.1YyC0IGqtYEtOYWUH2UExCqbCvUWfJ5Mc-e9yacDgsw
 *      500:
 *         description: Error
 */

/**
 * @swagger
 * /api/v1/user/register:
 *  post:
 *    summary: Signup process
 *    tags: [Authentication]
 *    requestBody:
 *     required: true
 *     content:
 *        application/json:
 *         schema:
 *            $ref: '#/components/schemas/User-Signup'
 *    responses:
 *      200:
 *        description: Register Successfull
 *        content:
 *          application/json:
 *              schema:
 *               type: array
 *               items:
 *                name:
 *                 type: string
 *                email:
 *                 type: string
 *                createdAt:
 *                 type: string
 *                 format: date-time
 *               token:
 *                type: string
 *               example:
 *                status: success
 *                message: Created
 *                description: The request has succeeded and a new resource has been created as a result.
 *                data:
 *                 _id: 647b4eaf037c328ed479c1d9
 *                 name: rahul
 *                 email: rahul@yopmail.com
 *                 createdAt: 2021-12-06T10:52:59.939Z
 *                token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiUHJvdmlkZXIiLCJfaWQiOiI2MWFkZWI4YjUzMjBkNDQ0YzlkMzA3MTAiLCJlbWFpbCI6IlNpZW1lbnNAUHJvdmlkZXJzLm9yZyIsIm9yZ25hbWUiOiJPcmcxIiwiY3JlYXRlZEF0IjoiMjAyMS0xMi0wNlQxMDo1Mjo1OS45MzlaIiwidXBkYXRlZEF0IjoiMjAyMS0xMi0wNlQxMDo1Mjo1OS45MzlaIiwiX192IjowLCJpYXQiOjE2NDMwMjcxNDgsImV4cCI6MTY0MzExMzU0OH0.1YyC0IGqtYEtOYWUH2UExCqbCvUWfJ5Mc-e9yacDgsw
 *
 *      500:
 *         description: Error
 */

/**
 * @swagger
 * tags:
 *  name: User Management
 *  description: User Management API
 */

/**
 * @swagger
 * /api/v1/user:
 *  get:
 *    summary: Get all users
 *    tags: [User Management]
 *    responses:
 *      200:
 *        description: Users fetched successfully
 *        content:
 *          application/json:
 *              schema:
 *               type: array
 *               example:
 *                status: success
 *                message: Success
 *                description: The request has succeeded.
 *                data:
 *                  - _id: 647b4eaf037c328ed479c1d9
 *                    name: rahul
 *                    email: rahul@yopmail.com
 *                    createdAt: 2021-12-06T10:52:59.939Z
 *                  - _id: 6478efd049bb23a498c1b6c3
 *                    name: rahul
 *                    email: rahulb@yopmail.com
 *                    createdAt: 2021-12-06T10:52:59.939Z
 *
 *      500:
 *         description: Error
 */

router.post("/register", userController.create);
router.post("/login", userController.login);
router.post("/check-user-auth", userController.checkUserAuth);
router.get("/getUsers", authMiddleware, userController.getAll);
router.get("/", authMiddleware, userController.getUserDetail);
router.get("/:id", authMiddleware, userController.getById);
router.post("/logout", authMiddleware, userController.logout);
router.put("/", authMiddleware, userController.updateById);
router.delete("/:id", authMiddleware, userController.deleteById);
router.post("/forget-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/check-user/:walletAddress", userController.getByWalletAddress);
router.post("/check-email", userController.checkEmail);
router.post("/create", userController.createWithWalletAddress);

//2FA
router.post(
  "/enableTwoFactorAuth",
  authMiddleware,
  userController.enableTwoFactorAuth
);
router.post(
  "/verifyTwoFactorAuth",
  authMiddleware,
  userController.verifyTwoFactorAuth
);
router.post("/disableTwoFactorAuth", userController.disableTwoFactorAuth);

// getAllUsersWithPagination
router.post("/getAllUsers", userController.getAllUsersWithPagination);

// upload-image
router.post(
  "/upload-image",
  authMiddleware,
  upload,
  userController.uploadImage
);

// router.post(
//   "/upload-image-user",
//   authMiddleware,
//   upload,
//   userController.uploadToFilebaseIPFS
// );

router.post(
  "/upload-image-user",
  authMiddleware,
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    debug: true,
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
  }),
  userController.uploadToFilebaseIPFS
);

router.post(
  "/upload-image-pinata",
  authMiddleware,
  upload,
  userController.uploadImageForPinata.bind(userController)
);

router.get('/files/:folder', userController.getFilesByFolder);
router.delete('/files/:ipfsHash', userController.deleteFile);

// checkToken
router.post("/check-auth", userController.checkToken);
//verify-email
router.get("/verify/:token", userController.verifyEmail);
router.post("/request-password-reset", userController.requestPasswordReset);

export default router;
