import { createAuthClient } from "better-auth/svelte";
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';

export const authClient = createAuthClient({
  // baseURL: PUBLIC_BACKEND_API_URL || "http://localhost:8080"
    baseURL: "http://localhost:8080", // For now we use the localhost since ngrok fucks with the origin headers
});
