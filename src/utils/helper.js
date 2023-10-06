const fs = require("fs");

const deleteFile = (name) => {
  fs.unlink(`./src/uploads/images/${name}`);
};

module.exports = { deleteFile };
