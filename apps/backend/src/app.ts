import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { openapi } from "@elysiajs/openapi"
import { aboutRoute } from "./routes/about"
import { authHandler } from "./plugins/better-auth"
import { authMiddleware } from "./middlewares/better-auth"
import { areasRoutes } from "./routes/areas"
import { connectRoutes } from "./routes/connect"
import { betterAuth } from "better-auth/minimal"
import { OpenAPI } from "./plugins/better-api"

export const app = new Elysia()
  .use(cors())
  .use(openapi({
    exclude: { staticFile: false },
    documentation: {
      paths: await OpenAPI.getPaths(),
      components: await OpenAPI.components
    }
  }))
  .mount(authHandler)
  .use(aboutRoute)
  .use(authMiddleware)
  .use(connectRoutes)
  .use(areasRoutes)

export type App = typeof app
