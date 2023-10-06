const fs = require("fs");
const { pythonBaseURL } = require("../../../config/vars");
const { deleteFile } = require("../../../utils/helper");
const axios = require("axios");
const FormData = require("form-data");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const Avatar = require("../../models/avatar.model");
const Voice = require("../../models/voice.model");

exports.getAvatars = async (req, res, next) => {
  try {
    const { user: userId } = req;
    let filter = {};

    if (userId) {
      filter = {
        $or: [{ userId: new ObjectId(userId) }, { isDefault: true }],
      };
    } else {
      filter = {
        isDefault: true,
      };
    }

    const avatars = await Avatar.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1, isDefault: 1 } },
      {
        $project: {
          name: 1,
          id: 1,
          _id: 1,
          image: { $concat: [pythonBaseURL, "$image"] },
          isDefault: 1,
          description: 1,
        },
      },
    ]);

    if (avatars) {
      return res.status(200).send({
        data: avatars,
        message: "Avatar Fetch Successfully",
        success: true,
      });
    }
    return res.status(400).send({
      data: avatars,
      message: "No Avatar Found",
      success: false,
    });
  } catch (error) {
    return next(error);
  }
};
exports.getAvatar = async (req, res, next) => {
  try {
    const avatar = await Avatar.aggregate([
      { $match: { isDefault: true } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          name: 1,
          id: 1,
          _id: 1,
          image: { $concat: [pythonBaseURL, "$image"] },
          isDefault: 1,
          description: 1,
        },
      },
    ]);

    if (avatar) {
      return res.status(200).send({
        message: "Avatar Fetech Successfull",
        data: avatar[0],
        success: true,
      });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "No Default Avatar Found" });
    }
  } catch (error) {
    return next(error);
  }
};
exports.createAvatar = async (req, res, next) => {
  try {
    const { body: payload, user: userId, files: files } = req;
    for (const key in files) {
      const { fileName } = files[key][0];
      payload[`${key}`] = fileName;
    }
    const form = new FormData();
    const { name, voice, description, image_file } = payload;
    form.append("name", name);
    form.append("description", description);
    form.append("voice_id", voice);
    form.append("isDefault", "false");
    form.append("is_valid", "true");
    form.append(
      "image",
      fs.createReadStream(`./src/uploads/images/${image_file}`)
    );
    const url = `${pythonBaseURL}create_avatar`;

    http: try {
      const response = await axios.post(url, form);
      deleteFile(image_file);
      const {
        data: {
          data: { image, id },
        },
        data: { success = false, message = "" },
        status: status,
      } = response;

      if (status === 200 && success === true) {
        //setting payload to save in our local DB
        payload.image = image;
        payload.isDefault = false;
        payload.id = id;
        payload.userId = userId;

        const avatar = await Avatar.create(payload);

        if (avatar) {
          return res.status(200).send({
            data: avatar,
            success: true,
            message: "Avatar Created",
          });
        }
        return res.status(400).send({
          data: avatar,
          success: false,
          message: "Avatar Not Created",
        });
      } else {
        return res.status(400).send({
          data: {},
          success: false,
          message: message,
        });
      }
    } catch (error) {
      deleteFile(image_file);
      return res.status(500).send({
        data: error,
        success: false,
        message: "http python request failure",
      });
    }
  } catch (error) {
    return next(error);
  }
};
exports.getVoiceList = async (req, res, next) => {
  try {
    const voice = await Voice.aggregate([
      {
        $facet: {
          male_voice: [
            {
              $match: { type: true },
            },
            {
              $project: {
                _id: 0,
                voice: { $concat: [pythonBaseURL, "$voice"] },
                isDefault: 1,
                type: 1,
                id: 1,
                name: 1,
              },
            },
          ],
          female_voices: [
            {
              $match: { type: false },
            },
            {
              $project: {
                _id: 0,
                voice: { $concat: [pythonBaseURL, "$voice"] },
                isDefault: 1,
                type: 1,
                id: 1,
                name: 1,
              },
            },
          ],
        },
      },
    ]);

    if (voice) {
      return res.status(200).send({
        data: voice[0],
        message: "Data Fetech Successfull",
        success: true,
      });
    } else
      return res
        .status(400)
        .send({ data: voice, message: "Error Fetching Data", success: true });
  } catch (error) {
    return next(error);
  }
};
exports.validateImage = async (req, res, next) => {
  try {
    const { body: payload, files } = req;
    for (const key in files) {
      const { fileName } = files[key][0];
      payload[`${key}`] = fileName;
    }
    const { image } = payload;
    const form = new FormData();
    form.append("image", fs.createReadStream(`./src/uploads/images/${image}`));
    const url = `${pythonBaseURL}validate_image`;

    http: try {
      const response = await axios.post(url, form);
      const {
        data: {
          data: { is_valid = false },
        },
        data: { success = false },
        status,
      } = response;
      deleteFile(image);

      if (status === 200 && success === true) {
        //setting payload to save in our local DB
        const flag = is_valid;
        return res.status(200).send({
          data: flag,
          success: true,
          message: "Valid Image",
        });
      } else {
        return res.status(400).send({
          data: {},
          success: false,
          message: "python api failure",
        });
      }
    } catch (error) {
      deleteFile(image);
      return res.status(400).send({
        data: error,
        success: false,
        message: "python api failure",
      });
    }
  } catch (error) {
    return next(error);
  }
};
exports.deleteAvatar = async (req, res, next) => {
  try {
    const {
      params: { id },
    } = req;
    if (!id) {
      return res
        .status(400)
        .send({ message: "Incomplete Payload", success: false });
    }

    const avatar = await Avatar.findByIdAndRemove(id);

    if (avatar) {
      return res
        .status(200)
        .send({ success: true, message: "Avatar Deleted", data: avatar });
    } else
      return res
        .status(400)
        .send({ success: false, message: "Avatar Not Deleted" });
  } catch (error) {
    next(error);
  }
};
