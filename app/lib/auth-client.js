import { createAuthClient } from "better-auth/react";
import { socketUrl } from "./socket";

export const authClient = createAuthClient({
  baseURL: `${socketUrl}/api/auth`,
});
