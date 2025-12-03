import { Elysia } from "elysia";
import { generateTokenPair, jwtAccess, jwtRefresh } from "../middlewares/jwt";
import { authService } from "../services/auth.service";
import { validatePasswordStrenght } from "../middlewares/password";
import { ErrorResponse, LoginBody, LoginResponse, RegisterBody, RegisterResponse } from "../models/auth.model";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtAccess)
  .use(jwtRefresh)

  .post("/register", async ({ body, set }) => {
    try {
      const emailExists = await authService.emailExists(body.email)
      if (emailExists) {
        set.status = 409
        return {
          error: "Conflict",
          message: "User with this email already exists",
          statusCode: 409
        }
      }
      const passwordValidation = validatePasswordStrenght(body.password)
      if (!passwordValidation.valid) {
        set.status = 400
        return {
          error: "Bad Request",
          message: passwordValidation.errors.join(", "),
          statusCode: 400
        }
      }
      const user = await authService.createUser({
        email : body.email,
        password: body.password,
        name: body.name
      })
      set.status = 201
      return {
        message: "User registered successfully",
        userId: user.id
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to register user",
        statusCode: 500
      }
    }
  },
  {
    body: RegisterBody,
    response: {
      201: RegisterResponse,
      400: ErrorResponse,
      409: ErrorResponse,
      500: ErrorResponse
    },
    detail: {
      tags: ["Authentification"],
      summary: "Register a new user",
      description: "Creates a new user account with email and password"
    }
  })

  .post("/login", async ({ body, set, jwtAccess, jwtRefresh }) => {
    try {
      const user = await authService.userAuth(body.email, body.password)
      if (!user) {
        set.status = 401
        return {
          error: "Unauthorized",
          message: "Invalid email or password",
          statusCode: 401
        }
      }
      const tokens = await generateTokenPair(jwtAccess, jwtRefresh, user.id, user.email)
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to login",
        statusCode: 500
      }
    }
  },
  {
    body: LoginBody,
    response: {
      200: LoginResponse,
      401: ErrorResponse,
      500: ErrorResponse,
    },
    detail: {
      tags: ["Authentification"],
      summary: "Login with email and password",
      description: "Authentificates user and returns JWT tokens"
    }
  }
)