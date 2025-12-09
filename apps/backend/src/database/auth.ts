import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { expo } from "@better-auth/expo"
import { openAPI, bearer } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  plugins: [openAPI(), expo(), bearer()],
  trustedOrigins: [
    "http://localhost:5173", // Web client
    "exp://", // Allow Expo Go
    "area://", // The app scheme (app.json)
  ]
})
