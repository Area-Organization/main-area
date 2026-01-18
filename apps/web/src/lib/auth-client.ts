import { createAuthClient } from "better-auth/svelte";
import { emailOTPClient } from "better-auth/client/plugins";
import { PUBLIC_BACKEND_API_URL } from "$env/static/public";

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
  },
  plugins: [
    emailOTPClient()
  ]
});

export const auth = {
  signInEmail: authClient.signIn.email,
  signInSocial: authClient.signIn.social,
  signUpEmail: authClient.signUp.email,
  getSession: authClient.getSession,
  useSession: authClient.useSession,
  emailOtp: authClient.emailOtp,
  signOut: authClient.signOut
};
