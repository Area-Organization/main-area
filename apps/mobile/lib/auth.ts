import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.BACKEND_API_URL,
  plugins: [
    expoClient({
      scheme: "auth",
      storage: SecureStore
    })
  ]
});
