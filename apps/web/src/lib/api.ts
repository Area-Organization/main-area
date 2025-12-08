import { treaty } from "@elysiajs/eden";
import type { App } from "@area/backend/type";

export const client = treaty<App>("http://localhost:8080", {
  fetch: {
    credentials: "include"
  }
});
