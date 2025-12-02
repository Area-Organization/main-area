import { Elysia } from "elysia"
import { AboutResponse } from "../models/about.model"
import { serviceRegistry } from "../services/registry"

export const aboutRoute = new Elysia({ prefix: "" })
  .get("/about.json", ({ request }) => {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    return {
      client: { host: clientIp },
      server: {
        current_time: Math.floor(Date.now() / 1000),
        services: serviceRegistry.getAll()
      }
    }
  },
  {
    response: AboutResponse,
    detail: {
      tags: ["About"],
      summary: "Get platform information",
      description: "Returns information about the client, server time, and available services"
    }
  }
)