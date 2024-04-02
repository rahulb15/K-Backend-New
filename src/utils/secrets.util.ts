import dotenv from 'dotenv';
dotenv.config();
export const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
export const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;
export const DB_URL = process.env.DB_URL;
export const PORT = process.env.PORT;
// export const NODE_ENV = process.env.NODE_ENV;
