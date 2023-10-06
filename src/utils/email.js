const User = require("../api/models/user.model");
const formData = require("form-data");
const {
  hexSecret,
  siteBaseURL,
  mailGunApiKey,
  mailGunDomainURL,
  mailGunEmail,
  mailGunURL,
} = require("../../src/config/vars");
const jwt = require("jwt-simple");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const { emailTemplate } = require("./Templates/emailTemplate");
const { contactEmailTemplate } = require("./Templates/contactUsTemplate");
exports.sendEmail = async (
  email = "",
  route = "",
  subject = "",
  message = "",
  type = 0,
  content = null
) => {
  if (email !== "") {
    const api = mailGunApiKey;
    const domain = mailGunDomainURL;
    const mg = mailgun.client({
      username: "api",
      key: api,
      url: mailGunURL,
    });

    if (type === 1) {
      const name = email.split("@")[0];
      const contactContent = {
        name: name,
        subject: subject,
        message: message,
      };

      mg.messages
        .create(domain, {
          from: mailGunEmail,
          to: email,
          subject: subject,
          text: message,
          html: contactEmailTemplate(contactContent),
        })
        .then()
        .catch();
    } else {
      const user = await User.findOne({ email: email });
      const verificationCode = jwt.encode(user.email, hexSecret);
      const userSetter = await User.findOneAndUpdate(
        { email: email },
        { $set: { verificationCode: verificationCode } }
      );
      const name = email.split("@")[0];
      const url = `${siteBaseURL}${route}${verificationCode}`;

      mg.messages
        .create(domain, {
          from: mailGunEmail,
          to: email,
          subject: "Hello",
          text: "Testing some Mailgun awesomeness!",
          html: emailTemplate({ verificationUrl: url, name: name }),
        })
        .then()
        .catch();
    }
  }
};
