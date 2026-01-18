import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import { currentApiUrl, onUrlChange } from "./url-store";

const createAuth = (url: string) =>
  createAuthClient({
    baseURL: url,
    plugins: [
      expoClient({
        scheme: "area",
        storage: SecureStore
      }),
      emailOTPClient()
    ]
  });

let internalAuth = createAuth(currentApiUrl);

onUrlChange((newUrl) => {
  if (__DEV__) {
    console.log(`[Auth] Switching Auth client to ${newUrl}`);
  }
  internalAuth = createAuth(newUrl);
});

export const authClient = new Proxy({} as typeof internalAuth, {
  get(_target, prop) {
    return (internalAuth as any)[prop];
  }
});
