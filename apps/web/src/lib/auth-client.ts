import { createAuthClient } from "better-auth/svelte";
import { PUBLIC_BACKEND_API_URL } from "$env/static/public";
import { dev } from "$app/environment";

// const url = dev ? "http://localhost:8080" : PUBLIC_BACKEND_API_URL;
const url = PUBLIC_BACKEND_API_URL;

const authClient = createAuthClient({
  baseURL: url,
  fetchOptions: {
    headers: {
      "ngrok-skip-browser-warning": "true"
    },
    credentials: "omit",
    auth: {
      type: "Bearer",
      token: () => {
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem("area-auth-token") || "";
        }
        return "";
      }
    },
    onSuccess: (ctx) => {
      if (typeof localStorage !== "undefined") {
        const authToken = ctx.response.headers.get("set-auth-token");
        if (authToken) {
          localStorage.setItem("area-auth-token", authToken);
        }
      }
    }
  }
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

  signInSocial: async (provider: string, callbackURL?: string) => {
    return authClient.signIn.social({
      provider,
      callbackURL
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

  getSession: async (request?: Request) => {
    if (request) {
      return authClient.getSession({
        fetchOptions: {
          headers: {
            cookie: request.headers.get("cookie") || ""
          }
        }
      });
    } else {
      return authClient.getSession();
    }
  },

  useSession: () => {
    return authClient.useSession();
  }
};
