import { treaty } from "@elysiajs/eden";
import type { App } from "@area/backend/type";
import { PUBLIC_BACKEND_API_URL } from "$env/static/public";

// export const client = treaty<App>(PUBLIC_BACKEND_API_URL || "http://localhost:8080", {
export const client = treaty<App>("http://localhost:8080", { // For now we use the localhost since ngrok fucks with the origin headers
  fetch: {
    credentials: "include"
  }
});
