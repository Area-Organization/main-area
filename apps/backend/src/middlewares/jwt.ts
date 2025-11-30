import { jwt } from "@elysiajs/jwt"
import { Elysia } from "elysia"

const JWT_SECRET = Bun.env.JWT_SECRET
const JWT_REFRESH_SECRET = Bun.env.JWT_REFRESH_SECRET
const ACCESS_TOKEN_EXPIRY = Bun.env.ACCESS_TOKEN_EXPIRY
const REFRESH_TOKEN_EXPIRY = Bun.env.REFRESH_TOKEN_EXPIRY

if (!JWT_SECRET || !ACCESS_TOKEN_EXPIRY || !JWT_REFRESH_SECRET || !REFRESH_TOKEN_EXPIRY)
  throw new Error('.env is required')


export interface JWTPayload {
  userId: string
  email: string
  type: "access" | "refresh"
}

export const jwtAccess = new Elysia({ name: "jwt-access" })
  .use(
    jwt({
      name: "jwtAccess",
      secret: JWT_SECRET,
      exp: ACCESS_TOKEN_EXPIRY
    })
  )

export const jwtRefresh = new Elysia({ name: "jwt-refresh" })
  .use(
    jwt({
      name: "jwtRefresh",
      secret: JWT_REFRESH_SECRET,
      exp: REFRESH_TOKEN_EXPIRY
    })
  )

export async function generateTokenPair(
  jwtAccessInstance: any,
  jwtRefreshInstance: any,
  userId: string,
  email: string
) {
  const [accessToken, refreshToken] = await Promise.all([
    jwtAccessInstance.sign({
      userId,
      email,
      type: "access"
    }),
    jwtRefreshInstance.sign({
      userId,
      email,
      type: "refresh"
    })
  ])
  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY
  }
}

export const TOKEN_EXPIRY = {
  access: ACCESS_TOKEN_EXPIRY,
  refresh: REFRESH_TOKEN_EXPIRY
}