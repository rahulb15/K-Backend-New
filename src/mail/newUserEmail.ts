import { transporter } from './transporter.mail';
// import Mail from "nodemailer/lib/mailer";
import ejs from 'ejs';
import path from 'path';
import { IUser } from '../interfaces/user/user.interface';
// export const sendForgetPasswordMail = async (user: IUser, token: string) => {
//   const data = await ejs.renderFile(
//     path.join(__dirname, '../views/forgetPassword/forgetPasswordTemplate.ejs'),
//     {
//       name: user.name,
//       link: `${process.env.BASE_URL}/reset-password/${token}`,
//     },
//   );
//   const mailOptions = {
//     from: 'rahul_baghel@seologistics.com',
//     to: user.email,
//     subject: 'Forget Password',
//     html: data,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//   } catch (e) {
//     console.log(e);
//   }
// };

export const newUserEmail = async (user: IUser, token: string) => {
    console.log('new user email', user, token);
    const data = await ejs.renderFile(
        path.join(__dirname, '../views/newUser/newUserTemplate.ejs'),
        {
        name: user.name,
        link: `${process.env.BASE_URL}/verify?token=${token}`,
        },
    );
    const mailOptions = {
        from: 'test@kryptomerch.io',
        to: user.email,
        subject: 'New User',
        html: data,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (e) {
        console.log(e);
    }
}

