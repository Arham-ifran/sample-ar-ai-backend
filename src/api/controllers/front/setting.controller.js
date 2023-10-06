const Setting = require("../../models/setting.model");

exports.upsertSetting = async (req, res) => {
  try {
    const { body: payload } = req;

    if (!payload) {
      res.status(400).send({ success: false, message: "Payload Incomplete" });
    }

    const settings = await Setting.findOneAndUpdate(
      {},
      {
        $set: payload,
      },
      {
        new: true,
        upsert: true,
      }
    );
    if (settings)
      return res.json({
        success: true,
        message: "Settings Added Successfully",
        settings,
      });
    else
      res
        .status(400)
        .send({ suceess: false, message: "Settings Update Failed" });
  } catch (error) {
    return next(error);
  }
};
