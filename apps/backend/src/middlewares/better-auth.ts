import { Elysia } from "elysia"
import { auth } from "@area/shared"

export const authMiddleware = new Elysia({ name: "auth" })
  .macro({
    auth: {
      async resolve({ request: { headers }, set }) {
        const session = await auth.api.getSession({ headers })
        if (!session) {
          set.status = 401
          throw new Error("Unauthoried")
        }
        return {
          user: session.user,
          session: session.session,
        }
      }
    }
  })
