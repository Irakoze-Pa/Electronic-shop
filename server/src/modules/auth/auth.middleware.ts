import type { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { User } from "../user/user.model.js";
import type { UserRole } from "../user/user.types.js";
import { authService } from "./auth.service.js";
import { verifyAccessToken } from "./token.service.js";

export const authCookieName = "access_token";

async function authenticate(request: Parameters<RequestHandler>[0]) {
  const bearer = request.headers.authorization;
  const token =
    (request.cookies?.[authCookieName] as string | undefined) ??
    (bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined);
  if (!token) return false;
  let userId: string;
  try {
    userId = verifyAccessToken(token);
  } catch {
    throw new AppError("Invalid or expired authentication", 401);
  }
  const user = await User.findById(userId);
  if (!user) throw new AppError("Authentication user no longer exists", 401);
  if (user.status !== "Active") throw new AppError("Account is inactive", 403);
  request.authUser = authService.safeUser(user);
  return true;
}

export const optionalAuth: RequestHandler = async (
  request,
  _response,
  next,
) => {
  await authenticate(request);
  next();
};

export const requireAuth: RequestHandler = async (request, _response, next) => {
  if (!(await authenticate(request)))
    throw new AppError("Authentication required", 401);
  next();
};

export function requireRole(role: UserRole): RequestHandler {
  return (request, _response, next) => {
    if (!request.authUser) throw new AppError("Authentication required", 401);
    if (request.authUser.role !== role)
      throw new AppError("Insufficient permissions", 403);
    next();
  };
}
