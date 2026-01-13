import { createAuthClient } from "better-auth/svelte";
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
import { dev } from '$app/environment';

const url = dev ? "http://localhost:8080" : PUBLIC_BACKEND_API_URL;

export const authClient = createAuthClient({
    baseURL: url
});
