const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupSchema = new Schema({
  groupname: {
    type: String,
    required: true,
    unique: true,
  },
  users: {
    type: [Schema.Types.ObjectId],
  },
});

module.exports = mongoose.model("group", groupSchema);
