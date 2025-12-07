import { app } from "./app"
import { hookManager } from "./hooks/manager"

app.listen(8080)

hookManager.start()

process.on("SIGINT", () => {
  console.log("\nShutting down sucessfuly")
  hookManager.stop()
  process.exit(0)
})
process.on("SIGTERM", () => {
  console.log("\nShutting down sucessfuly")
  hookManager.stop()
  process.exit(0)
})

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`)
