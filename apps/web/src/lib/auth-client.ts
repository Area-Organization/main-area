import { createAuthClient } from "better-auth/svelte";
import { PUBLIC_BACKEND_API_URL } from "$env/static/public";

const authClient = createAuthClient({
  // baseURL: PUBLIC_BACKEND_API_URL || "http://localhost:8080"
  baseURL: "http://localhost:8080" // For now we use the localhost since ngrok fucks with the origin headers
});

export const auth = {
  signInEmail: async (email: string, password: string, rememberMe?: boolean, callbackURL?: string) => {
    return authClient.signIn.email({
      email: email,
      password: password,
      rememberMe: rememberMe ?? false,
      callbackURL: callbackURL ?? ""
    });
  },

  signUpEmail: async (email: string, password: string, name: string, callbackURL?: string) => {
    return authClient.signUp.email({
      name: name,
      email: email,
      password: password,
      callbackURL: callbackURL ?? ""
    });
  },

  getSession: async (request: Request) => {
    return authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: request.headers.get("cookie") || ""
        }
      }
    });
  },

  useSession: () => {
    return authClient.useSession();
  }
};
