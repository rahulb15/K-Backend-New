import userController from '../controllers/user.controller';
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

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



router.post('/register', userController.create);
router.post('/login', userController.login);
router.get('/', authMiddleware, userController.getAll);
router.get('/:id', authMiddleware, userController.getById);
router.post('/logout', authMiddleware, userController.logout);
router.put('/:id', authMiddleware, userController.updateById);
router.delete('/:id', authMiddleware, userController.deleteById);
router.post('/forget-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

export default router;