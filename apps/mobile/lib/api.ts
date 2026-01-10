import { treaty } from "@elysiajs/eden";
import type { App } from "@area/backend/type";
import { authClient } from "./auth";
import { currentApiUrl, onUrlChange } from "./url-store";

const createEdenClient = (url: string) =>
  treaty<App>(url, {
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

let internalClient = createEdenClient(currentApiUrl);

onUrlChange((newUrl) => {
  if (__DEV__) {
    console.log(`[API] Switching Eden client to ${newUrl}`);
  }
  internalClient = createEdenClient(newUrl);
});

// Proxy to forward all requests to the current internalClient
export const client = new Proxy({} as typeof internalClient, {
  get(_target, prop) {
    return (internalClient as any)[prop];
  },
  apply(_target, _thisArg, argArray) {
    return (internalClient as any)(...argArray);
  }
});

export type AreaClient = typeof internalClient;
