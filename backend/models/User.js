const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    password: {
      type: String,
      required: false,
      select: false
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    refreshTokenHash: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

module.exports =  mongoose.models.User || mongoose.model("User", userSchema);