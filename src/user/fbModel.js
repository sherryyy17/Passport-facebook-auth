const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  facebookId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  photo: {
    data: Buffer
  },
},{timestamps:true});

const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };