const User = require("../../models/user.model");
const { passwordEncryptionKey } = require("../../../config/vars");
const jwt = require("jsonwebtoken");

exports.userValidation = async (req, res, next) => {
  let flag = true;
  req.user = 0;
  if (req.headers["x-access-token"]) {
    await jwt.verify(
      req.headers["x-access-token"],
      passwordEncryptionKey,
      async (err, authorizedData) => {
        if (err) {
          flag = false;
          const message =
            "session expired or incorrect accesstoken";
          return res.send({
            success: false,
            userDisabled: true,
            user404: true,
            message,
            err,
          });
        } else {
          req.user = authorizedData.sub;
          const user = await User.findById({ _id: req.user }).lean();
          if (!user) {
            flag = false;
            return res.send({
              success: false,
              user404: true,
              message: "There is no account linked to that id",
              notExist: 1,
            });
          }
        }
      }
    );
  } else if (req.method.toLocaleLowerCase() !== "options") {
    req.user = 0;
  }
  if (flag) next();
};
