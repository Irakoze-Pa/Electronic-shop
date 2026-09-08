import type { SafeUser } from "../modules/user/user.types.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: SafeUser;
    }
  }
}

export {};
