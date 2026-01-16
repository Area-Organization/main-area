import { Elysia, t } from "elysia"
import { authMiddleware } from "../middlewares/better-auth"
import { prisma } from "../database/prisma"
import { serviceRegistry } from "../services/registry"
import {
  AreaDeletedResponse,
  AreaErrorResponse,
  AreaResponse,
  AreasListResponse,
  AreaStatsResponse,
  AreaToggleResponse,
  CreateAreaBody,
  ListAreasQuery,
  UpdateAreaBody
} from "@area/types"

export const areasRoutes = new Elysia({ prefix: "/api/areas" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ body, user, set }) => {
      try {
        const actionService = serviceRegistry.get(body.action.serviceName)
        if (!actionService) {
          set.status = 400
          return {
            error: "Bad Request",
            message: `Service '${body.action.serviceName}' not found`,
            statusCode: 400
          }
        }
        const action = actionService.actions.find((a) => a.name === body.action.actionName)
        if (!action) {
          set.status = 400
          return {
            error: "Bad Request",
            message: `Action '${body.action.actionName}' not found in service '${body.action.serviceName}'`,
            statusCode: 400
          }
        }

        for (const r of body.reactions) {
          const reactionService = serviceRegistry.get(r.serviceName)
          if (!reactionService) {
            set.status = 400
            return {
              error: "Bad Request",
              message: `Service '${r.serviceName}' not found`,
              statusCode: 400
            }
          }
          const reaction = reactionService.reactions.find((def) => def.name === r.reactionName)
          if (!reaction) {
            set.status = 400
            return {
              error: "Bad Request",
              message: `Reaction '${r.reactionName}' not found in '${r.serviceName}'`,
              statusCode: 400
            }
          }
          const reactionConnection = await prisma.userConnection.findUnique({
            where: {
              id: r.connectionId,
              userId: user.id
            }
          })
          if (!reactionConnection) {
            set.status = 404
            return {
              error: "Not Found",
              message: `Reaction connection not found for ${r.serviceName}`,
              statusCode: 404
            }
          }
        }

        const actionConnection = await prisma.userConnection.findUnique({
          where: {
            id: body.action.connectionId,
            userId: user.id
          }
        })
        if (!actionConnection) {
          set.status = 404
          return {
            error: "Not Found",
            message: "Action connection not found",
            statusCode: 404
          }
        }

        const actionSetupContext = {
          userId: user.id,
          tokens: {
            accessToken: actionConnection.accessToken || undefined,
            refreshToken: actionConnection.refreshToken || undefined,
            expiresAt: actionConnection.expiresAt?.getTime()
          },
          metadata: {}
        }

        if (action.setup) {
          await action.setup(body.action.params, actionSetupContext)
        }

        const actionParamsWithMetadata = {
          ...body.action.params,
          metadata: actionSetupContext.metadata
        }

        const area = await prisma.area.create({
          data: {
            name: body.name,
            description: body.description,
            userId: user.id,
            action: {
              create: {
                serviceName: body.action.serviceName,
                actionName: body.action.actionName,
                params: actionParamsWithMetadata,
                connectionId: body.action.connectionId,
                posX: body.action.posX ?? 100,
                posY: body.action.posY ?? 200
              }
            },
            reactions: {
              create: body.reactions.map((r, index) => ({
                serviceName: r.serviceName,
                reactionName: r.reactionName,
                params: r.params,
                connectionId: r.connectionId,
                posX: r.posX ?? 600,
                posY: r.posY ?? 100 + index * 200
              }))
            }
          },
          include: {
            action: true,
            reactions: true
          }
        })
        set.status = 201
        return {
          area: {
            id: area.id,
            name: area.name,
            description: area.description ?? undefined,
            enabled: area.enabled,
            lastTriggered: area.lastTriggered?.toISOString(),
            triggerCount: area.triggerCount,
            createdAt: area.createdAt.toISOString(),
            updatedAt: area.updatedAt.toISOString(),
            action: area.action
              ? {
                  id: area.action.id,
                  serviceName: area.action.serviceName,
                  actionName: area.action.actionName,
                  params: area.action.params as Record<string, any>,
                  connectionId: area.action.connectionId,
                  posX: area.action.posX,
                  posY: area.action.posY
                }
              : undefined,
            reactions: area.reactions.map((r) => ({
              id: r.id,
              serviceName: r.serviceName,
              reactionName: r.reactionName,
              params: r.params as Record<string, any>,
              connectionId: r.connectionId,
              posX: r.posX,
              posY: r.posY
            }))
          }
        }
      } catch (error) {
        set.status = 500
        return {
          error: "Internal Server Error",
          message: `${error}`,
          statusCode: 500
        }
      }
    },
    {
      auth: true,
      body: CreateAreaBody,
      response: {
        201: AreaResponse,
        400: AreaErrorResponse,
        404: AreaErrorResponse,
        500: AreaErrorResponse
      },
      detail: {
        tags: ["Areas"],
        summary: "Create a new AREA",
        description: "Creates a new automation by connecting an action to reactions"
      }
    }
  )

  .get(
    "/",
    async ({ query, user, set }) => {
      try {
        const limit = query.limit ?? 20
        const offset = query.offset ?? 0
        const where: any = { userId: user.id }

        if (query.enabled !== undefined) {
          where.enabled = query.enabled
        }
        if (query.search) {
          where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }]
        }
        const [areas, total] = await Promise.all([
          prisma.area.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
            include: {
              action: true,
              reactions: true
            }
          }),
          prisma.area.count({ where })
        ])
        return {
          areas: areas.map((area) => ({
            id: area.id,
            name: area.name,
            description: area.description ?? undefined,
            enabled: area.enabled,
            lastTriggered: area.lastTriggered?.toISOString(),
            triggerCount: area.triggerCount,
            createdAt: area.createdAt.toISOString(),
            updatedAt: area.updatedAt.toISOString(),
            action: area.action
              ? {
                  id: area.action.id,
                  serviceName: area.action.serviceName,
                  actionName: area.action.actionName,
                  params: area.action.params as Record<string, any>,
                  connectionId: area.action.connectionId,
                  posX: area.action.posX,
                  posY: area.action.posY
                }
              : undefined,
            reactions: area.reactions.map((r) => ({
              id: r.id,
              serviceName: r.serviceName,
              reactionName: r.reactionName,
              params: r.params as Record<string, any>,
              connectionId: r.connectionId,
              posX: r.posX,
              posY: r.posY
            }))
          })),
          total,
          limit,
          offset
        }
      } catch (error) {
        set.status = 500
        return {
          error: "Internal Server Error",
          message: "Failed to fetch AREAs",
          statusCode: 500
        }
      }
    },
    {
      auth: true,
      query: ListAreasQuery,
      response: {
        200: AreasListResponse,
        500: AreaErrorResponse
      },
      detail: {
        tags: ["Areas"],
        summary: "List all AREAs",
        description: "Retrieves all automation areas for the authentificated user"
      }
    }
  )
  .get(
    "/:id",
    async ({ params, user, set }) => {
      try {
        const area = await prisma.area.findFirst({
          where: {
            id: params.id,
            userId: user.id
          },
          include: {
            action: true,
            reactions: true
          }
        })
        if (!area) {
          set.status = 404
          return {
            error: "Not Found",
            message: "AREA not found",
            statusCode: 404
          }
        }
        return {
          area: {
            id: area.id,
            name: area.name,
            description: area.description ?? undefined,
            enabled: area.enabled,
            lastTriggered: area.lastTriggered?.toISOString(),
            triggerCount: area.triggerCount,
            createdAt: area.createdAt.toISOString(),
            updatedAt: area.updatedAt.toISOString(),
            action: area.action
              ? {
                  id: area.action.id,
                  serviceName: area.action.serviceName,
                  actionName: area.action.actionName,
                  params: area.action.params as Record<string, any>,
                  connectionId: area.action.connectionId,
                  posX: area.action.posX,
                  posY: area.action.posY
                }
              : undefined,
            reactions: area.reactions.map((r) => ({
              id: r.id,
              serviceName: r.serviceName,
              reactionName: r.reactionName,
              params: r.params as Record<string, any>,
              connectionId: r.connectionId,
              posX: r.posX,
              posY: r.posY
            }))
          }
        }
      } catch (error) {
        set.status = 500
        return {
          error: "Internal Server Error",
          message: "Failed to fetch AREA",
          statusCode: 500
        }
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String()
      }),
      response: {
        200: AreaResponse,
        404: AreaErrorResponse,
        500: AreaErrorResponse
      },
      detail: {
        tags: ["Areas"],
        summary: "Get an AREA by ID",
        description: "Retrieves a specific automation area"
      }
    }
  )
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      try {
        const existingArea = await prisma.area.findFirst({
          where: { id: params.id, userId: user.id }
        })
        if (!existingArea) {
          set.status = 404
          return {
            error: "Not Found",
            message: "AREA not found",
            statusCode: 404
          }
        }
        if (body.action) {
          const actionService = serviceRegistry.get(body.action.serviceName)
          if (!actionService) {
            set.status = 400
            return {
              error: "Bad Request",
              message: `Service '${body.action.serviceName} not found'`,
              statusCode: 400
            }
          }
          const action = actionService.actions.find((a) => a.name === body.action?.actionName)
          if (!action) {
            set.status = 400
            return {
              error: "Bad request",
              message: `Action '${body.action.actionName}' not found`,
              statusCode: 400
            }
          }
          const actionConnection = await prisma.userConnection.findFirst({
            where: {
              id: body.action.connectionId,
              userId: user.id
            }
          })
          if (!actionConnection) {
            set.status = 404
            return {
              error: "Not Found",
              message: `Action connection not found`,
              statusCode: 404
            }
          }
        }

        if (body.reactions) {
          for (const r of body.reactions) {
            const reactionService = serviceRegistry.get(r.serviceName)
            if (!reactionService) {
              set.status = 400
              return {
                error: "Bad Request",
                message: `Service '${r.serviceName} not found'`,
                statusCode: 400
              }
            }
            const reaction = reactionService.reactions.find((a) => a.name === r.reactionName)
            if (!reaction) {
              set.status = 400
              return {
                error: "Bad request",
                message: `Reaction '${r.reactionName}' not found`,
                statusCode: 400
              }
            }
            const reactionConnection = await prisma.userConnection.findFirst({
              where: {
                id: r.connectionId,
                userId: user.id
              }
            })
            if (!reactionConnection) {
              set.status = 404
              return {
                error: "Not Found",
                message: `Reaction connection not found for ${r.serviceName}`,
                statusCode: 404
              }
            }
          }
        }

        const area = await prisma.area.update({
          where: { id: params.id },
          data: {
            name: body.name,
            description: body.description,
            enabled: body.enabled,
            ...(body.action && {
              action: {
                update: {
                  serviceName: body.action.serviceName,
                  actionName: body.action.actionName,
                  params: body.action.params,
                  connectionId: body.action.connectionId,
                  posX: body.action.posX,
                  posY: body.action.posY
                }
              }
            }),
            ...(body.reactions && {
              reactions: {
                deleteMany: {},
                create: body.reactions.map((r) => ({
                  serviceName: r.serviceName,
                  reactionName: r.reactionName,
                  params: r.params,
                  connectionId: r.connectionId,
                  posX: r.posX ?? 0,
                  posY: r.posY ?? 0
                }))
              }
            })
          },
          include: {
            action: true,
            reactions: true
          }
        })
        return {
          area: {
            id: area.id,
            name: area.name,
            description: area.description ?? undefined,
            enabled: area.enabled,
            lastTriggered: area.lastTriggered?.toISOString(),
            triggerCount: area.triggerCount,
            createdAt: area.createdAt.toISOString(),
            updatedAt: area.updatedAt.toISOString(),
            action: area.action
              ? {
                  id: area.action.id,
                  serviceName: area.action.serviceName,
                  actionName: area.action.actionName,
                  params: area.action.params as Record<string, any>,
                  connectionId: area.action.connectionId,
                  posX: area.action.posX,
                  posY: area.action.posY
                }
              : undefined,
            reactions: area.reactions.map((r) => ({
              id: r.id,
              serviceName: r.serviceName,
              reactionName: r.reactionName,
              params: r.params as Record<string, any>,
              connectionId: r.connectionId,
              posX: r.posX,
              posY: r.posY
            }))
          }
        }
      } catch (error) {
        set.status = 500
        return {
          error: "Internal Server Error",
          message: "Failed to update AREA",
          statusCode: 500
        }
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String()
      }),
      body: UpdateAreaBody,
      response: {
        200: AreaResponse,
        400: AreaErrorResponse,
        404: AreaErrorResponse,
        500: AreaErrorResponse
      },
      detail: {
        tags: ["Areas"],
        summary: "Update an AREA",
        description: "Updates an existing automation area"
      }
    }
  )
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      try {
        const area = await prisma.area.findFirst({
          where: {
            id: params.id,
            userId: user.id
          }
        })
        if (!area) {
          set.status = 404
          return {
            error: "Not Found",
            message: "AREA not found",
            statusCode: 404
          }
        }
        await prisma.area.delete({
          where: { id: params.id }
        })
        return {
          message: "AREA deleted successfully",
          enabled: false
        }
      } catch (error) {
        set.status = 500
        return {
          error: "Internal Server Error",
          message: "Failed to delete AREA",
          statusCode: 500
        }
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String()
      }),
      response: {
        200: AreaDeletedResponse,
        404: AreaErrorResponse,
        500: AreaErrorResponse
      },
      detail: {
        tags: ["Areas"],
        summary: "Delete an AREA",
        description: "Permanently deletes an automation area"
      }
    }
  )
  .post(
    "/:id/toggle",
    async ({ params, user, set }) => {
      try {
        const area = await prisma.area.findFirst({
          where: {
            id: params.id,
            userId: user.id
          }
        })
        if (!area) {
          set.status = 404
          return {
            error: "Not Found",
            message: "AREA not found",
            statusCode: 404
          }
        }
        const updatedArea = await prisma.area.update({
          where: { id: params.id },
          data: { enabled: !area.enabled }
        })
        return {
          message: `AREA ${updatedArea.enabled ? "enabled" : "disabled"} successfully`,
          enabled: updatedArea.enabled
        }
      } catch (error) {
        set.status = 500
        return {
          error: "Internal Server Error",
          message: "Failed to toggle AREA",
          statusCode: 500
        }
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String()
      }),
      response: {
        200: AreaToggleResponse,
        404: AreaErrorResponse,
        500: AreaErrorResponse
      },
      detail: {
        tags: ["Areas"],
        summary: "Toggle AREA status",
        description: "Enables or disables an autimation area"
      }
    }
  )
  .get(
    "/stats/overview",
    async ({ user, set }) => {
      try {
        const [totalAreas, activeAreas, inactiveAreas, recentAreas] = await Promise.all([
          prisma.area.count({ where: { userId: user.id } }),
          prisma.area.count({ where: { userId: user.id, enabled: true } }),
          prisma.area.count({ where: { userId: user.id, enabled: false } }),
          prisma.area.findMany({
            where: {
              userId: user.id,
              lastTriggered: { not: null }
            },
            orderBy: { lastTriggered: "desc" },
            take: 5,
            select: {
              id: true,
              name: true,
              lastTriggered: true
            }
          })
        ])
        const totalTriggers = await prisma.area.aggregate({
          where: { userId: user.id },
          _sum: { triggerCount: true }
        })
        return {
          totalAreas,
          activeAreas,
          inactiveAreas,
          totalTriggers: totalTriggers._sum.triggerCount ?? 0,
          recentlyTriggered: recentAreas.map((area) => ({
            id: area.id,
            name: area.name,
            triggeredAt: area.lastTriggered!.toISOString()
          }))
        }
      } catch (error) {
        set.status = 500
        return {
          error: "Internal Server Error",
          message: "Failed to fetch AREA statistics",
          statusCode: 500
        }
      }
    },
    {
      auth: true,
      response: {
        200: AreaStatsResponse,
        500: AreaErrorResponse
      },
      detail: {
        tags: ["Areas"],
        summary: "Get AREA statistics",
        description: "Retrieves overview statistics for user's automation areas"
      }
    }
  )
