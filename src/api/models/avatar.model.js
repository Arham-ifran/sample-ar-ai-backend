const mongoose = require("mongoose");
const AvatarSchema = new mongoose.Schema(
  {
    name: { type: String, default: "avatar" },
    image: { type: String, require: true },
    description: { type: String },
    typeStudio: { type: Boolean, default: false }, // true = studio avatar, false = chat AR-AI avatar
    type: { type: Boolean, default: true }, // true = human avatar, false = ai or animated avatar
    hq: { type: Boolean, default: false }, //hq = true mean high quality image of which user can change size and backgroup color
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      require: true,
    },
    isDefault: { type: Boolean, default: true }, // true means created by admin and false means user created
  },
  { timestamps: true }
);

module.exports = mongoose.model("Avatar", AvatarSchema);
