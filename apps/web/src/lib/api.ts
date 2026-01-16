import { treaty } from "@elysiajs/eden";
import type { App } from "@area/backend/type";
import { PUBLIC_BACKEND_API_URL } from "$env/static/public";
import { dev } from "$app/environment";

// const url = dev ? "http://localhost:8080" : PUBLIC_BACKEND_API_URL;
const url = PUBLIC_BACKEND_API_URL;

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);

    if (typeof localStorage !== "undefined") {
        const token = localStorage.getItem("area-auth-token");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
    }

    headers.set("ngrok-skip-browser-warning", "true");

    const newInit: RequestInit = {
        ...init,
        headers
    };

    return fetch(input, newInit);
}

export const client = treaty<App>(url, {
  fetcher: customFetch
});
