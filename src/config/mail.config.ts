export const mailConfig = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  logger: false,
  debug: false,
  secureConnection: false,
  auth: {
    user: 'gamefever92@gmail.com',
    pass: 'QAUSRWjkV2gfKPOz',
  },
  tls: {
    rejectUnAuthorized: true,
  },
};
