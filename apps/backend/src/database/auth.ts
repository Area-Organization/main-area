import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { expo } from "@better-auth/expo"
import { openAPI } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  plugins: [openAPI(), expo()],
  trustedOrigins: [
    "exp://", // Allow Expo Go
    "mobile://" // The app scheme (match app.json)
  ]
})
