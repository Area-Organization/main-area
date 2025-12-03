import { t, type Static } from "elysia"

// Register

export const RegisterBody = t.Object({
  email: t.String({
    format: "email",
    error: "Invalid email format"
  }),
  password: t.String({
    minLength: 8,
    error: "Password must be at least 8 characters"
  }),
  name: t.String({
    minLength: 2,
    maxLength: 50
  })
})

export const RegisterResponse = t.Object({
  message: t.String(),
  userId: t.String()
})

// Login

export const LoginBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String()
})

export const LoginResponse = t.Object({
  accessToken: t.String(),
  refreshToken: t.String(),
  expiresIn: t.Number(),
  user: t.Object({
    id: t.String(),
    email: t.String(),
    name: t.String()
  })
})

// Token

export const RefreshTokenBody = t.Object({
  refreshToken: t.String()
})

export const RefreshTokenResponse = t.Object({
  accessToken: t.String(),
  expiresIn: t.Number()
})

// Oauth2

export const OAuth2Body = t.Object({
  code: t.String(),
  state: t.Optional(t.String())
})

export const OAuth2Response = t.Object({
  accessToken: t.String(),
  refreshToken: t.String(),
  expiresIn: t.Number(),
  user: t.Object({
    id: t.String(),
    email: t.String(),
    name: t.String()
  })
})

// Infos

export const UserInfo = t.Object({
  id: t.String(),
  email: t.String(),
  name: t.String(),
  createdAt: t.Number(),
  emailVerified: t.Boolean()
})

// Error

export const ErrorResponse = t.Object({
  error: t.String(),
  message: t.String(),
  statusCode: t.Number()
})

export type RegisterBodyType = Static<typeof RegisterBody>
export type RegisterResponseType = Static<typeof RegisterResponse>
export type LoginBodyType = Static<typeof LoginBody>
export type LoginResponseType = Static<typeof LoginResponse>
export type RefreshTokenBodyType = Static<typeof RefreshTokenBody>
export type RefreshTokenResponseType = Static<typeof RefreshTokenResponse>
export type OAuth2BodyType = Static<typeof OAuth2Body>
export type OAuth2ResponseType = Static<typeof OAuth2Response>
export type UserInfoType = Static<typeof UserInfo>
export type ErrorResponseType = Static<typeof ErrorResponse>


