import { Elysia } from "elysia";
import { jwtAccess } from "./jwt";
import { bearer } from "@elysiajs/bearer";

export const authMiddleware = new Elysia({ name: "auth" })
  .use(bearer())
  .use(jwtAccess)
  .derive(async ({ bearer, jwtAccess, set }) => {
    
    if (!bearer) {
      set.status = 401
      throw new Error("Missing Authorization header")
    }
    
    const payload = await jwtAccess.verify(bearer)
    
    if (!payload) {
      set.status = 401
      throw new Error("Invalid or expired token")
    }
    
    return {
      user: {
        id: payload.userId as string,
        email: payload.email as string
      }
    }
  })