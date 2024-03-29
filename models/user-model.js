import { Schema, model, ObjectId, Error } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import UserRole from "../enums/UserRole.js";

const schema = new Schema(
  {
    account: {
      type: String,
      required: [true, "缺少帳號"],
      minlength: [4, "使用者帳號長度不足，至少 4 碼"],
      maxlength: [15, "使用者帳號長度過長，最多 15 碼"],
      unique: true,
      validate: {
        validator(value) {
          return validator.isAlphanumeric(value);
        },
        message: "使用者帳號格式，僅可輸入英數字",
      },
    },
    email: {
      type: String,
      required: [true, "缺少使用者信箱"],
      unique: true,
      validate: {
        validator(value) {
          return validator.isEmail(value);
        },
        message: "使用者信箱格式錯誤",
      },
    },
    password: {
      type: String,
      required: [true, "請填入密碼"],
    },
    tokens: {
      type: [String],
    },
    role: {
      type: Number,
      default: UserRole.ADMIN,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

schema.pre("save", function (next) {
  const user = this;
  if (user.isModified("password")) {
    if (user.password.length < 4 || user.password.length > 15) {
      const error = new Error.ValidationError(null);
      error.addError(
        "password",
        new Error.ValidatorError({ message: "密碼長度不符 4~15 碼" })
      );
      next(error);
      return;
    } else {
      user.password = bcrypt.hashSync(user.password, 10);
    }
  }
  next();
});

export default model("users", schema);
