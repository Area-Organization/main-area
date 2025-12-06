import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { openapi } from "@elysiajs/openapi"
import { aboutRoute } from "./routes/about"
import { authHandler } from "./plugins/better-auth"
import { authMiddleware } from "./middlewares/better-auth"

export const app = new Elysia()
  .use(cors())
  .use(openapi({ exclude: { staticFile: false } }))
  .mount("/api/auth", authHandler)
  .use(authMiddleware)
  .use(aboutRoute)

export type App = typeof app
