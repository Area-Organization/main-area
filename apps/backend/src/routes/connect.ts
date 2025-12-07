import { Elysia, t } from "elysia"
import { prisma } from "../database/prisma"
import { authMiddleware } from "../middlewares/better-auth"
import { serviceRegistry } from "../services/registry"
import { ConnectionErrorResponse, ConnectionResponse, ConnectionsListResponse, CreateConnectionBody } from "@area/types"

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
  
