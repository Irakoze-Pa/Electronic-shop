import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import { passwordSchema } from "../modules/auth/auth.validation.js";
import { User } from "../modules/user/user.model.js";

async function seedAdmin() {
  const email = env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.INITIAL_ADMIN_PASSWORD;
  const firstName = env.INITIAL_ADMIN_FIRST_NAME?.trim();
  const lastName = env.INITIAL_ADMIN_LAST_NAME?.trim();
  if (!email || !password || !firstName || !lastName) {
    throw new Error(
      "Set all INITIAL_ADMIN_* environment variables before seeding",
    );
  }
  passwordSchema.parse(password);
  await connectDatabase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "Admin")
      throw new Error("That email already belongs to a non-admin user");
    console.info("Admin account already exists");
    return;
  }
  await User.create({
    firstName,
    lastName,
    email,
    password: await bcrypt.hash(password, 12),
    role: "Admin",
    status: "Active",
  });
  console.info("Admin account created");
}

seedAdmin()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Failed to seed admin",
    );
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
