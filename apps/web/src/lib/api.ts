import { treaty } from "@elysiajs/eden";
import type { App } from "@area/backend/type";

export const client = treaty<App>(import.meta.env.BACKEND_API_URL || "http://localhost:8080", {
  fetch: {
    credentials: "include"
  }
});
