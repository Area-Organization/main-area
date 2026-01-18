import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { expo } from "@better-auth/expo"
import { openAPI, bearer, emailOTP } from "better-auth/plugins"
import { mailer } from "../utils/mailer"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user }) => {
      console.log(`[AUTH] Déclenchement de l'OTP pour : ${user.email}`)
      await auth.api.sendVerificationOTP({
        body: {
          email: user.email,
          type: "email-verification"
        }
      })
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "dummy_client_id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy_client_secret"
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_client_secret"
    }
  },

  advanced: {
    // Required for Dokploy/Traefik: tells Better-Auth to send Secure cookies
    // even if the internal connection between Traefik and Bun is HTTP
    useSecureCookies: true
  },
  cookie: {
    // Allows the session cookie to be recognized by both app.epi-area.me and api.epi-area.me
    domain: process.env.NODE_ENV === "production" ? ".epi-area.me" : undefined,
    extraAttributes: {
      sameSite: "Lax"
    }
  },

  plugins: [
    openAPI(),
    expo(),
    bearer(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await mailer.sendVerificationCode(email, otp)
      }
    })
  ],
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173", "exp://", "area://"]
})
