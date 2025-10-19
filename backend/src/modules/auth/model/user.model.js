// src/modules/auth/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user","personnel", "admin"],
      default: "user",
    }, // Personnel Registration Below
    firstName: {
      type: String,
      required: [
        function () {
          return this.role === "personnel";
        },
        "First name is required for personnel",
      ],
    },
    middleName: { type: String }, // Optional for personnel
    lastName: {
      type: String,
      required: [
        function () {
          return this.role === "personnel";
        },
        "Last name is required for personnel",
      ],
    },
    occupation: {
      type: String,
      required: [
        function () {
          return this.role === "personnel";
        },
        "Occupation is required for personnel",
      ],
    },
    institutionName: {
      type: String,
      required: [
        function () {
          return this.role === "personnel";
        },
        "Institution name is required for personnel",
      ],
    },
    verified: {
      type: Boolean,
      default: function () {
        return this.role === "personnel" ? false : true; // Personnel start unverified
      },
    },
  },
  { timestamps: true } // Adds createdAt, updatedAt
);

export default mongoose.model("User", userSchema);