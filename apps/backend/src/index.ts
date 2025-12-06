import { app } from "./app"

app.listen(8080)

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`)
