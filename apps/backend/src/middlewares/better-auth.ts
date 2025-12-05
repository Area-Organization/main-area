import { Elysia } from "elysia"
import { auth } from "@area/shared"

export const authMiddleware = new Elysia({ name: "auth" })
  .derive(async ({ request, set }) => {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    if (!session) {
      set.status = 401
      throw new Error("Unauthorized")
    }
    return {
      user: session.user,
      session: session.session
    }
  })