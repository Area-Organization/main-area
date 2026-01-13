import { createAuthClient } from "better-auth/svelte";
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
import { dev } from '$app/environment';

// const url = dev ? "http://localhost:8080" : PUBLIC_BACKEND_API_URL;
const url = PUBLIC_BACKEND_API_URL;

export const authClient = createAuthClient({
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
