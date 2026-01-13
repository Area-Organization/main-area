import { treaty } from "@elysiajs/eden";
import type { App } from "@area/backend/type";
import { PUBLIC_BACKEND_API_URL } from "$env/static/public";
import { dev } from "$app/environment";

const url = dev ? "http://localhost:8080" : PUBLIC_BACKEND_API_URL;

export const client = treaty<App>(url, {
  fetch: {
    credentials: "include"
  }
});
