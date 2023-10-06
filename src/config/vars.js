// import .env variables
require("dotenv").config();
module.exports = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  hexSecret: process.env.HEX_KEY,
  mongoURI: process.env.MONGO_URI,
  pythonBaseURL: process.env.PYTHON_BASE_URL,
  siteBaseURL: process.env.FRONT_APP_BASE_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  frontEncSecret: process.env.FRONT_ENC_SECRET,
  passwordEncryptionKey: process.env.PASSWORD_ENCRYPTION_KEY,
  mailGunDomainURL: process.env.MAILGUN_DOMAIN_URL,
  mailGunApiKey: process.env.MAILGUN_API_KEY,
  mailGunURL: process.env.MAILGUN_URL,
  mailGunEmail: process.env.MAILGUN_EMAIL,
  stripeServerKey: process.env.STRIPE_SERVER_KEY,
  webhookSecret: process.env.STRIPE_SERVER_KEY,
  webhookURL: process.env.WEBHOOK_URL,
};
