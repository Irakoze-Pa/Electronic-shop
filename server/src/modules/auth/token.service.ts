import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const issuer = "electronic-shop-api";
const audience = "electronic-shop-client";

export function signAccessToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: "HS256",
    audience,
    expiresIn: env.JWT_EXPIRES_IN,
    issuer,
    subject: userId,
  });
}

export function verifyAccessToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
    audience,
    issuer,
  });
  if (typeof payload === "string" || !payload.sub)
    throw new Error("Invalid token payload");
  return payload.sub;
}
