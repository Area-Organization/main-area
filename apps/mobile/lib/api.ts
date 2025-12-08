import { treaty } from "@elysiajs/eden";
import type { App } from "@area/backend/type";

export const client = treaty<App>(process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080");

export type AreaClient = typeof client;
