const mongoose = require("mongoose");
const VoiceSchema = new mongoose.Schema(
  {
    name: { type: String, default: "voice" },
    id: { type: String, require: true },
    type: { type: Boolean, require: true }, //true== male,false==female
    voice: { type: String, require: true },
    isDefault: { type: Boolean, default: true },
    premium: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Voice", VoiceSchema);
