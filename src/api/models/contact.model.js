const mongoose = require("mongoose");
const ContactSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: Boolean, default: false }, // it will be true when admin will aprove this
  },
  { timestamps: true }
);
module.exports = mongoose.model("Contact", ContactSchema);
