const mongoose = require("mongoose");

const mongoDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {})
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = {
  mongoDB,
};
