// multer
const fs = require("fs");
const multer = require("multer");
const uploadsDir = "./src/uploads/";
const imagesDir = `${uploadsDir}images`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // make uploads directory if do not exist
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const fileExtension = file.mimetype.split("/")[1];
    if (
      !file.originalname
        .toLowerCase()
        .match(/\.(jpg|jpeg|png|gif|svg|mp3|wav|mpeg)$/)
    ) {
      return cb(new Error("Only image and audio files are allowed."));
    }
    cb(null, +Date.now() + "." + fileExtension);
  },
});

const upload = multer({ storage });
exports.imageFileUpload = upload.fields([{ name: "image_file", maxCount: 1 }]);
exports.imageUpload = upload.fields([{ name: "image", maxCount: 1 }]);
exports.audioUpload = upload.fields([{ name: "audio_file", maxCounty: 1 }]);
