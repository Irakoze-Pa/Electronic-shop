import type { CookieOptions, RequestHandler } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { authCookieName } from "./auth.middleware.js";
import { authService } from "./auth.service.js";
import { signAccessToken } from "./token.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  maxAge: env.JWT_EXPIRES_IN * 1000,
  sameSite: "strict",
  secure: env.NODE_ENV === "production",
  path: "/",
};

function setAuthCookie(
  response: Parameters<RequestHandler>[1],
  userId: string,
) {
  response.cookie(authCookieName, signAccessToken(userId), cookieOptions);
}

export const register: RequestHandler = async (request, response) => {
  const user = await authService.register(registerSchema.parse(request.body));
  setAuthCookie(response, user._id);
  response
    .status(201)
    .json({ success: true, data: user, message: "Registration successful" });
};

export const login: RequestHandler = async (request, response) => {
  const user = await authService.login(loginSchema.parse(request.body));
  setAuthCookie(response, user._id);
  response.json({ success: true, data: user, message: "Login successful" });
};

export const me: RequestHandler = (request, response) => {
  if (!request.authUser) throw new AppError("Authentication required", 401);
  response.json({ success: true, data: request.authUser });
};

export const logout: RequestHandler = (_request, response) => {
  response.clearCookie(authCookieName, { ...cookieOptions, maxAge: undefined });
  response.json({ success: true, message: "Logout successful" });
};
