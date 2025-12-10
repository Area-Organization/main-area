import { treaty } from "@elysiajs/eden";
import type { App } from "@area/backend/type";
import { authClient } from "./auth";

export const client = treaty<App>(process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080", {
  fetch: { credentials: "include" },
  onRequest: async (path, options) => {
    try {
      const session = await authClient.getSession();
      const rawToken = session.data?.session.token;

      if (rawToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${rawToken}`
        };
      }
    } catch (error) {
      console.error("[Client] Failed to attach auth cookie", error);
    }
  }
});

export type AreaClient = typeof client;
