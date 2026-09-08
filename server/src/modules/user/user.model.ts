import { Schema, model } from "mongoose";
import type { UserRole, UserStatus } from "./user.types.js";
import { userRoles, userStatuses } from "./user.types.js";

export interface UserDocument {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    role: { type: String, enum: userRoles, default: "Customer", index: true },
    status: {
      type: String,
      enum: userStatuses,
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, value) => {
        delete (value as Partial<UserDocument>).password;
        return value;
      },
    },
  },
);

export const User = model("User", userSchema);
