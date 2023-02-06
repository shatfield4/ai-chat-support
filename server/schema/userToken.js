const mongoose = require("mongoose");

// Create a new user token object
const userTokenSchema = new mongoose.Schema({
  access_token: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
});

const userToken = mongoose.model("users", userTokenSchema);

module.exports = userToken;
