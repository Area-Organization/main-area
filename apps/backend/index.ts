import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { PrismaClient } from "@area/shared";

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .get("/", () => "Hello Area")

  // The mandatory about.json route (mock for now)
  .get("/about.json", ({ request }) => {
    const clientIp = app.server?.requestIP(request)?.address || "unknown";
    const currentTime = Math.floor(Date.now() / 1000);

    return {
      client: {
        host: clientIp
      },
      server: {
        current_time: currentTime,
        services: [
          // You need to dynamically populate this from your DB or Service definitions
          {
            name: "github",
            actions: [{ name: "new_commit", description: "New Commit" }],
            reactions: []
          }
        ]
      }
    };
  })
  .listen(8080); // Strict requirement: Port 8080

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
