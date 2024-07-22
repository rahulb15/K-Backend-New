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

export const approveLaunchpadEmail = async (user: IUser, password: string) => {
    const data = await ejs.renderFile(
        path.join(__dirname, '../views/approveLaunchpadEmail/approveLaunchpadTemplate.ejs'),
        {
        name: user.name,
        username: user.username,
        password: password,
        link: `${process.env.ADMIN_URL}session/admin-signin`,
        },
    );
    const mailOptions = {
        from: 'test@kryptomerch.io',
        to: user.email,
        subject: 'Launchpad Approval',
        html: data,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (e) {
        console.log(e);
    }
}

