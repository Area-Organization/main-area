import { Elysia } from "elysia";
import { auth } from "@area/shared";

export const betterAuth = new Elysia({ name: "better-auth" })
  .all("/api/auth/*", async ({ request }) => {
    return await auth.handler(request)
  })