import type { AuthUser } from "./auth/middleware.js";

export type Env = {
  Variables: {
    user: AuthUser;
  };
};
