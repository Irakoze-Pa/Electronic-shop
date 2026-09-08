import bcrypt from "bcryptjs";
import type { HydratedDocument } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { User, type UserDocument } from "../user/user.model.js";
import type { SafeUser } from "../user/user.types.js";
import type { LoginInput, RegisterInput } from "./auth.types.js";

function safeUser(user: HydratedDocument<UserDocument>): SafeUser {
  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<SafeUser> {
    if (await User.exists({ email: input.email })) {
      throw new AppError("An account with that email already exists", 409);
    }
    const user = await User.create({
      ...input,
      password: await bcrypt.hash(input.password, 12),
      role: "Customer",
      status: "Active",
    });
    return safeUser(user);
  },

  async login(input: LoginInput): Promise<SafeUser> {
    const user = await User.findOne({ email: input.email }).select("+password");
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new AppError("Invalid email or password", 401);
    }
    if (user.status !== "Active")
      throw new AppError("Account is inactive", 403);
    return safeUser(user);
  },

  safeUser,
};
