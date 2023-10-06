const mongoose = require('./config/mongoose');
const app = require('./config/express');
mongoose.connect();

module.exports = app;