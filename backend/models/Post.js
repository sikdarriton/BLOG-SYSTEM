const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  timestamps: String,
  isDeleted: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
});

module.exports =
  mongoose.models.Post || mongoose.model("Post", postSchema);