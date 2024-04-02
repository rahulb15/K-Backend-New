import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { mailConfig } from '../config/mail.config';

export const transporter = nodemailer.createTransport( mailConfig as Mail.Options );
