const http = require("http");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const express = require("express");
const socketIO = require("socket.io");
const FormData = require("form-data");
const bodyParser = require("body-parser");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const bearerToken = require("express-bearer-token");
const { port, pythonBaseURL } = require("../config/vars");
const frontAuth = require("../api/middlewares/front/auth");
const frontRoutes = require("../api/routes/v1/front/index");
const pythonRoutes = require("../api/routes/v1/python-backend/index");
const webhookRoutes = require("../api/routes/v1/stripe/webHook.route");
const Payment = require("../api/models/payment.model");
const User = require("../api/models/user.model");
const { passwordEncryptionKey } = require("../config/vars");
const jwt = require("jsonwebtoken");
const multer = require("multer");
/**
 * express instance
 * @public
 */
const app = express();
const server = http.createServer(app);

const io = socketIO(server);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 90000,
});

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// store connected clients
const clients = new Map(); // map to store client information

// set socket
io.on("connection", async (socket) => {
  app.set("socket", io);
});

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(upload.none());
app.use(bearerToken());

app.use(express.static(path.join(__dirname, "../uploads")));

// apply the rate limiting middleware to API calls only
app.use("/v1/", apiLimiter);

// compress all responses
app.use(compression());

// authentication middleware to enforce authnetication and authorization
app.use(frontAuth.userValidation);

// authentication middleware to get token
app.use(frontAuth.authenticate);

// mount front api v1 routes
app.use("/v1/front", frontRoutes);
//mount python api v1 routes
app.use("/v1/python", pythonRoutes);
//mount stripe webhook
app.use("/v1/stripe", webhookRoutes);
// front site build path
app.use("/", express.static(path.join(__dirname, "../../build")));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../../build", "index.html"));
});

// handle socket connections
io.on("connection", (socket) => {
  // store client information
  clients.set(socket.id, socket);
  // handle chat message
  socket.on(
    "chat-message",
    async ({ message, recipient, tokens, accessToken }) => {
      if (clients.has(recipient)) {
        let userId = "";
        if (accessToken) {
          await jwt.verify(
            accessToken,
            passwordEncryptionKey,
            async (err, authorizedData) => {
              if (err) {
                flag = false;
                const message = "session_expired_front_error";
                return res.send({
                  success: false,
                  userDisabled: true,
                  message,
                  err,
                });
              } else {
                userId = authorizedData.sub;
                user = await User.findById({ _id: userId }).lean();
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
        }
        const recipientSocket = clients.get(recipient);
        const url = `${pythonBaseURL}broadcast/${message.avatar}/`;

        const form = new FormData();
        form.append("text", message.text);
        http: try {
          const response = await axios.post(url, form);
          if (response.status === 200 && response.data.success === true) {
            await Payment.findOneAndUpdate(
              { userId: userId, status: true },
              { remainingTextCHatTokens: tokens - 1 }
            );
            const data = response.data.data; // localtest
            recipientSocket.emit("chat message", data);
          }
        } catch (error) {
          return error;
        }
      }
    }
  );

  // handle disconnect event
  socket.on("disconnect", () => {
    clients.delete(socket.id); // remove client information
  });
});

// running server
server.listen(port);

module.exports = app;
