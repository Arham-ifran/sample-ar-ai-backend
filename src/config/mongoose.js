const mongoose = require("mongoose");
const Payment = require("../api/models/payment.model"); // Import the Payment model
const { mongoURI, env } = require("./vars");

// exit application on error
mongoose.connection.on("error", (err) => {
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === "development") {
  mongoose.set("debug", true);
}

/**
 * connect to mongo db
 *
 * @returns {object} mongoose connection
 * @public
 */
exports.connect = () => {
  try {
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.connection.once("open", () => {
      Payment.ensureIndexes({ userId: 1, status: 1 });
    });
    return mongoose.connection;
  } catch (error) {
    return error.message;
  }
};
