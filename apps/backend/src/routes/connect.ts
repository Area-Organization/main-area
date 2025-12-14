import { Elysia, t, redirect } from "elysia"
import { prisma } from "../database/prisma"
import { authMiddleware } from "../middlewares/better-auth"
import { serviceRegistry } from "../services/registry"
import { 
  ConnectionDeletedResponse, 
  ConnectionErrorResponse, 
  ConnectionResponse, 
  ConnectionsListResponse, 
  CreateConnectionBody, 
  OAuth2AuthUrlQuery, 
  OAuth2AuthUrlResponse, 
  UpdateConnectionBody, 
  type OAuth2TokenResponseType 
} from "@area/types"

const getBaseUrl = () => process.env.BACKEND_API_URL || 'http://localhost:8080'
const encodeState = (data: Record<string, any>) => Buffer.from(JSON.stringify(data)).toString('base64')
const decodeState = (state: string) => {
  try {
    return JSON.parse(Buffer.from(state, 'base64').toString('ascii'))
  } catch {
    return null
  }
}

export const connectRoutes = new Elysia({ prefix: "/api/connections" })
  .use(authMiddleware)
  .post("/", async ({ body, user, set }) => {
    try {
      const service = serviceRegistry.get(body.serviceName)
      if (!service) {
        set.status = 400
        return {
          error: "Bad Request",
          message: `Service '${body.serviceName}' not found`,
          statusCode: 400
        }
      }
      const existingConnection = await prisma.userConnection.findUnique({
        where: {
          userId_serviceName: {
            userId: user.id,
            serviceName: body.serviceName
          }
        }
      })
      if (existingConnection) {
        set.status = 409
        return {
          error: "Conflict",
          message: `Connection to '${body.serviceName}' already exists`,
          statusCode: 409
        }
      }
      const connection = await prisma.userConnection.create({
        data: {
          userId: user.id,
          serviceName: body.serviceName,
          accessToken: body.accessToken,
          refreshToken: body.refreshToken,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          metadata: body.metadata ?? undefined
        }
      })
      set.status = 201
      return {
        connection: {
          id: connection.id,
          serviceName: connection.serviceName,
          expiresAt: connection.expiresAt?.toISOString(),
          createdAt: connection.createdAt.toISOString(),
          updatedAt: connection.updatedAt.toISOString(),
          metadata: connection.metadata as Record<string, any> | undefined
        }
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to create connection",
        statusCode: 500
      }
    }
  }, {
    auth: true,
    body: CreateConnectionBody,
    response: {
      201: ConnectionResponse,
      400: ConnectionErrorResponse,
      409: ConnectionErrorResponse,
      500: ConnectionErrorResponse
    },
    detail: {
      tags: ["Connections"],
      summary: "Create a service connection",
      description: "Creates a new connection to a service for the authentificated user"
    }
  })

  .get("/", async ({ user, set }) => {
    try {
      const connections = await prisma.userConnection.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      return {
        connections: connections.map(conn => ({
          id: conn.id,
          serviceName: conn.serviceName,
          expiresAt: conn.expiresAt?.toISOString(),
          createdAt: conn.createdAt.toISOString(),
          updatedAt: conn.updatedAt.toISOString(),
          metadata: conn.metadata as Record<string, any> | undefined
        })),
        total: connections.length
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to fetch connections",
        statusCode: 500
      }
    }
  }, {
    auth: true,
    response: {
      200: ConnectionsListResponse,
      500: ConnectionErrorResponse
    },
    detail: {
      tags: ["Connections"],
      summary: "List all service connections",
      description: "Retrieves all service connections for the authentificated user"
    }
  })

  .get("/:id", async ({ params, user, set }) => {
    try {
      const connection = await prisma.userConnection.findFirst({
        where: {
          id: params.id,
          userId: user.id
        }
      })
      if (!connection) {
        set.status = 404
        return {
          error: "Not Found",
          message: "Connection not found",
          statusCode: 404
        }
      }
      return {
        connection: {
          id: connection.id,
          serviceName: connection.serviceName,
          expiresAt: connection.expiresAt?.toISOString(),
          createdAt: connection.createdAt.toISOString(),
          updatedAt: connection.updatedAt.toISOString(),
          metadata: connection.metadata as Record<string, any> | undefined
        }
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to fetch connection",
        statusCode: 500
      }
    }
  }, {
    auth: true,
    params: t.Object({
      id: t.String()
    }),
    response: {
      200: ConnectionResponse,
      404: ConnectionErrorResponse,
      500: ConnectionErrorResponse
    },
    detail: {
      tags: ["Connections"],
      summary: "Get a connection by ID",
      description: "Retrieves a specific service connection"
    }
  })

  .patch("/:id", async ({ params, body, user, set }) => {
    try {
      const existingConnection = await prisma.userConnection.findFirst({
        where: {
          id: params.id,
          userId: user.id
        }
      })
      if (!existingConnection) {
        set.status = 404
        return {
          error: "Not Found",
          message: "Connection not found",
          statusCode: 404
        }
      }
      const connection = await prisma.userConnection.update({
        where: { id: params.id },
        data: {
          accessToken: body.accessToken,
          refreshToken: body.refreshToken,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
          metadata: body.metadata ?? undefined
        }
      })
      return {
        connection: {
          id: connection.id,
          serviceName: connection.serviceName,
          expiresAt: connection.expiresAt?.toISOString(),
          createdAt: connection.createdAt.toISOString(),
          updatedAt: connection.updatedAt.toISOString(),
          metadata: connection.metadata as Record<string, any> | undefined
        }
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to update connection",
        statusCode: 500
      }
    }
  }, {
    auth: true,
    params: t.Object({
      id: t.String()
    }),
    body: UpdateConnectionBody,
    response: {
      200: ConnectionResponse,
      404: ConnectionErrorResponse,
      500: ConnectionErrorResponse
    },
    detail: {
      tags: ["Connections"],
      summary: "Update a connection",
      description: "Updates an existing service connection"
    }
  })

  .delete("/:id", async ({ params, user, set }) => {
    try {
      const connection = await prisma.userConnection.findFirst({
        where: {
          id: params.id,
          userId: user.id
        }
      })
      if (!connection) {
        set.status = 404
        return {
          error: "Not Found",
          message: "Connection not found",
          statusCode: 404
        }
      }
      const areasUsingConnection = await prisma.area.count({
        where: {
          OR: [
            { action: { connectionId: params.id } },
            { reaction: { connectionId: params.id }}
          ]
        }
      })
      if (areasUsingConnection > 0) {
        set.status = 409
        return {
          error: "Conflict",
          message: `Cannot delete connection: it is used by ${areasUsingConnection} AREA(s)`,
          statusCode: 409
        }
      }
      await prisma.userConnection.delete({
        where: { id: params.id }
      })
      return {
        message: "Connection deleted successfully",
        connectionId: params.id
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to delete connection",
        statusCode: 500
      }
    }
  }, {
    auth: true,
    params: t.Object({
      id: t.String()
    }),
    response: {
      200: ConnectionDeletedResponse,
      404: ConnectionErrorResponse,
      409: ConnectionErrorResponse,
      500: ConnectionErrorResponse
    },
    detail: {
      tags: ["Connections"],
      summary: "Delete a connection",
      description: "Permanently deletes a service connection"
    }
  })

  .get("/oauth2/:serviceName/auth-url", async ({ params, query, user, set }) => {
    try {
      const service = serviceRegistry.get(params.serviceName)
      if (!service) {
        set.status = 404
        return {
          error: "Not Found",
          message: `Service '${params.serviceName}' not found`,
          statusCode: 404
        }
      }
      if (!service.requiresAuth || service.authType !== 'oauth2' || !service.oauth) {
        set.status = 400
        return {
          error: "Bad Request",
          message: `Service '${params.serviceName}' does not support OAuth2`,
          statusCode: 400
        }
      }
      const state = encodeState({
        serviceName: params.serviceName,
        userId: user.id,
        callbackUrl: query.callbackUrl,
        nonce: crypto.randomUUID()
      })
      const authUrl = new URL(service.oauth.authorizationUrl)
      authUrl.searchParams.set('client_id', service.oauth.clientId)
      authUrl.searchParams.set('redirect_uri', `${getBaseUrl()}/api/connections/oauth2/callback`)
      authUrl.searchParams.set('scope', service.oauth.scopes.join(' '))
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent')
      return {
        authUrl: authUrl.toString(),
        state
      }
    } catch (error) {
      console.error("Error generating OAuth2 URL:", error)
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to generate authorization URL",
        statusCode: 500
      }
    }
  }, {
    auth: true,
    params: t.Object({
      serviceName: t.String()
    }),
    query: OAuth2AuthUrlQuery,
    response: {
      200: OAuth2AuthUrlResponse,
      400: ConnectionErrorResponse,
      404: ConnectionErrorResponse,
      500: ConnectionErrorResponse
    },
    detail: {
      tags: ["Connections"],
      summary: "Get OAuth2 authorization URL",
      description: "Generates an OAuth2 authorization URL for a service"
    }
  })

  .get("/oauth2/callback", async ({ query, set }) => {
    try {
      const { code, state } = query
      if (!code || !state) {
        set.status = 400
        return "Missing code or state"
      }
      const stateData = decodeState(state)
      if (!stateData || !stateData.userId || !stateData.serviceName) {
        set.status = 400
        return "Invalid state parameter"
      }
      const { userId, serviceName, callbackUrl } = stateData
      const service = serviceRegistry.get(serviceName)
      if (!service || !service.requiresAuth || service.authType !== 'oauth2' || !service.oauth) {
        set.status = 400
        return "Invalid service configuration"
      }
      const tokenResponse = await fetch(service.oauth.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `${getBaseUrl()}/api/connections/oauth2/callback`,
          client_id: service.oauth.clientId,
          client_secret: service.oauth.clientSecret
        })
      })
      if (!tokenResponse.ok) {
        const redirectURL = new URL(callbackUrl || "area://oauth-callback")
        redirectURL.searchParams.set("status", "error")
        redirectURL.searchParams.set("message", "Token exchange failed")
        return redirect(redirectURL.toString())
      }
      const tokens = await tokenResponse.json() as OAuth2TokenResponseType
      const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
      await prisma.userConnection.upsert({
        where: {
          userId_serviceName: {
            userId,
            serviceName
          }
        },
        create: {
          userId,
          serviceName,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt,
          metadata: {
            tokenType: tokens.token_type,
            scope: tokens.scope
          }
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt,
          metadata: {
            tokenType: tokens.token_type,
            scope: tokens.scope
          }
        }
      })
      const redirectURL = new URL(callbackUrl || "area://oauth-callback")
      redirectURL.searchParams.set("status", "success")
      redirectURL.searchParams.set("service", serviceName)
      return redirect(redirectURL.toString())
    } catch (error) {
      console.error("OAuth Callback Error:", error)
      return set.status = 500
    }
  }, {
    query: t.Object({
      code: t.String(),
      state: t.String()
    })
  })