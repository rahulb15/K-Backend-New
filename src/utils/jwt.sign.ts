import jwt from 'jsonwebtoken';
import { JWT_USER_SECRET, JWT_ADMIN_SECRET } from './secrets.util';
import { IUser } from '../interfaces/user/user.interface';

// export const jwtSign = (user: IUser) => {
//   const token = jwt.sign({ id: user._id }, JWT_USER_SECRET as string, {
//     expiresIn: 86400,
//   });
//   return token;
// };

// export const jwtVerify = (token: string) => {
//   const decoded = jwt.verify(token, JWT_USER_SECRET as string);
//   return decoded;
// };

export const jwtSign = (user: IUser, admin?: boolean) => {
  const token = jwt.sign({ id: user._id }, admin ? JWT_ADMIN_SECRET as string : JWT_USER_SECRET as string, {
    expiresIn: 86400,
  });
  return token;
};

export const jwtVerify = (token: string, admin?: boolean) => {
  const decoded = jwt.verify(token, admin ? JWT_ADMIN_SECRET as string : JWT_USER_SECRET as string);
  return decoded;
};
