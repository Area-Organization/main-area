import { Elysia, t } from "elysia"
import { prisma } from "../database/prisma"
import { authMiddleware } from "../middlewares/better-auth"
import { serviceRegistry } from "../services/registry"
import { ConnectionDeletedResponse, ConnectionErrorResponse, ConnectionResponse, ConnectionsListResponse, CreateConnectionBody, OAuth2AuthUrlResponse, OAuth2CallbackBody, UpdateConnectionBody, type OAuth2TokenResponseType } from "@area/types"

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
          matadata: connection.metadata as Record<string, any> | undefined
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

  .get("/oauth2/:serviceName/auth-url", async ({ params, user, set }) => {
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
      const state = crypto.randomUUID()
      const authUrl = new URL(service.oauth.authorizationUrl)
      authUrl.searchParams.set('client_id', service.oauth.clientId)
      authUrl.searchParams.set('redirect_uri', `${process.env.API_URL || 'http://localhost:8080'}/api/connections/oauth2/callback`)
      authUrl.searchParams.set('scope', service.oauth.scopes.join(' '))
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('response_type', 'code')
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

  .post("/oauth2/callback", async ({ body, user, set }) => {
    try {
      const service = serviceRegistry.get(body.serviceName)
      if (!service) {
        set.status = 404
        return {
          error: "Not Found",
          message: `Service '${body.serviceName}' not found`,
          statusCode: 404
        }
      }
      if (!service.requiresAuth || service.authType !== 'oauth2' || !service.oauth) {
        set.status = 400
        return {
          error: "Bad Request",
          message: `Service '${body.serviceName}' does not support OAuth2`,
          statusCode: 400
        }
      }
      const tokenResponse = await fetch(service.oauth.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: body.code,
          redirect_uri: `${process.env.API_URL || 'http://localhost:8080'}/api/connections/oauth2/callback`,
          client_id: service.oauth.clientId,
          client_secret: service.oauth.clientSecret
        })
      })
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}))
        console.error("OAuth2 token exchange failed:", errorData)
        set.status = 400
        return {
          error: "Bad Request",
          message: "Failed to exchange authorization code for tokens",
          statusCode: 400
        }
      }
      const tokens = await tokenResponse.json() as OAuth2TokenResponseType
      const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
      const connection = await prisma.userConnection.upsert({
        where: {
          userId_serviceName: {
            userId: user.id,
            serviceName: body.serviceName
          }
        },
        create: {
          userId: user.id,
          serviceName: body.serviceName,
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
      console.error("Error handling OAuth2 callback:", error)
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to complete OAuth2 authentication",
        statusCode: 500
      }
    }
  }, {
    auth: true,
    body: OAuth2CallbackBody,
    response: {
      201: ConnectionResponse,
      400: ConnectionErrorResponse,
      404: ConnectionErrorResponse,
      500: ConnectionErrorResponse
    },
    detail: {
      tags: ["Connections"],
      summary: "Handle OAuth2 callback",
      description: "Exchanges authorization code for access tokens and creates/updates connection"
    }
  })
