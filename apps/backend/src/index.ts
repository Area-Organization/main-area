import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { openapi } from "@elysiajs/openapi"
import { aboutRoute } from "./routes/about"

export type { IService } from './services/interface';

const app = new Elysia()
  .use(cors())
  .use(openapi({ exclude: { staticFile: false } }))
  .use(aboutRoute)
  .listen(8080)

export type App = typeof app

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`)
