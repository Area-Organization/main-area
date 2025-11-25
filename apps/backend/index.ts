import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import openapi from "@elysiajs/openapi"

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .listen(8080)git push origin HEAD:<name-of-remote-branch>

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app
