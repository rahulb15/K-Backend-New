import { transporter } from './transporter.mail';
// import Mail from "nodemailer/lib/mailer";
import ejs from 'ejs';
import path from 'path';
import { IUser } from '../interfaces/user/user.interface';
export const passwordResetEmail = async (user: IUser, resetUrl: string) => {
    const data = await ejs.renderFile(
        path.join(__dirname, '../views/sentPasswordResetEmail/resetPasswordTemplate.ejs'),
        {
        name: user.name,
        username: user.username,
        password: resetUrl,
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

