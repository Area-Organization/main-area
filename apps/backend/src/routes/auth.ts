import Elysia from "elysia"
import { jwtAccess, jwtRefresh } from "../middlewares/jwt"


export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtAccess)
  .use(jwtRefresh)
  .post("/register", async ({ body, set }) => {
  })