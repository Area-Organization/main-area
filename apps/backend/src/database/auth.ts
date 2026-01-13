import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { expo } from "@better-auth/expo"
import { openAPI, bearer } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  },
  advanced: {
    // Required for Dokploy/Traefik: tells Better-Auth to send Secure cookies
    // even if the internal connection between Traefik and Bun is HTTP
    useSecureCookies: true
  },
  cookie: {
    // Allows the session cookie to be recognized by both app.epi-area.me and api.epi-area.me
    domain: process.env.NODE_ENV === "production" ? "epi-area.me" : undefined,
    extraAttributes: {
      sameSite: "Lax"
    }
  },
  plugins: [openAPI(), expo(), bearer()],
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173", "exp://", "area://"]
})
