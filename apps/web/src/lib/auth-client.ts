import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
    baseURL: import.meta.env.BACKEND_API_URL || "http://localhost:8080"
});
