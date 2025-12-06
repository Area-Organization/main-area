import { Elysia } from "elysia"
import { authMiddleware } from "../middlewares/better-auth"
import { prisma } from "@area/shared"
import { serviceRegistry } from "../services/registry"
import { AreaErrorResponse, AreaResponse, AreasListResponse, CreateAreaBody, ListAreasQuery } from "../models/area.model"

export const areasRoutes = new Elysia({ prefix: "/api/areas" })
  .use(authMiddleware)
  .post("/", async ({ body, user, set }) => {
    try{
      const actionService = serviceRegistry.get(body.action.serviceName)
      if (!actionService) {
        set.status = 400
        return {
          error: "Bad Request",
          message: `Service '${body.action.serviceName}' not found`,
          statusCode: 400
        }
      }
      const action = actionService.actions.find(a => a.name === body.action.actionName)
      if (!action) {
        set.status = 400
        return {
          error: "Bad Request",
          message: `Action '${body.action.actionName}' not found in service '${body.action.serviceName}'`,
          statusCode: 400
        }
      }
      const reactionService = serviceRegistry.get(body.reaction.serviceName)
      if (!reactionService) {
        set.status = 400
        return {
          error: "Bad Request",
          message: `Service '${body.reaction.serviceName}' not found`,
          statusCode: 400
        }
      }
      const reaction = reactionService.reactions.find(r => r.name === body.reaction.reactionName)
      if (!reaction) {
        set.status = 400
        return {
          error: "Bad Request",
          message: `Reaction '${body.reaction.reactionName}' not found in '${body.reaction.serviceName}'`,
          statusCode: 400
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
      const reactionConnection = await prisma.userConnection.findUnique({
        where: {
          id: body.reaction.connectionId,
          userId: user.id
        }
      })
      if (!reactionConnection) {
        set.status = 404
        return {
          error: "Not Found",
          message: "Reaction connection not found",
          statusCode: 404
        }
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
              params: body.action.params,
              connectionId: body.action.connectionId
            }
          },
          reaction: {
            create: {
              serviceName: body.reaction.serviceName,
              reactionName: body.reaction.reactionName,
              params: body.reaction.params,
              connectionId: body.reaction.connectionId
            }
          }
        },
        include: {
          action: true,
          reaction: true
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
          action: area.action ? {
            id: area.action.id,
            serviceName: area.action.serviceName,
            actionName: area.action.actionName,
            params: area.action.params as Record<string, any>,
            connectionId: area.action.connectionId
          } : undefined,
          reaction: area.reaction ? {
            id: area.reaction.id,
            serviceName: area.reaction.serviceName,
            reactionName: area.reaction.reactionName,
            params: area.reaction.params as Record<string, any>,
            connectionId: area.reaction.connectionId
          } : undefined
        }
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to create area",
        statusCode: 500
      }
    }
  }, {
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
      summary: "Create a new area",
      description: "Creates a new automation by connecting an action to a raction"
    }
  })
  
  .get("/", async ({ query, user, set }) => {
    try {
      const limit = query.limit ?? 20
      const offset = query.offset ?? 0
      const where: any = { userId: user.id }

      if (query.enabled !== undefined) {where.enabled = query.enabled }
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode : 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } }
        ]
      }
      const [areas, total] = await Promise.all([
        prisma.area.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            action: true,
            reaction: true
          }
        }),
        prisma.area.count({ where })
      ])
      return {
        areas: areas.map(area => ({
          id: area.id,
          name: area.name,
          description: area.description ?? undefined,
          enabled: area.enabled,
          lastTriggered: area.lastTriggered?.toISOString(),
          triggerCount: area.triggerCount,
          createdAt: area.createdAt.toISOString(),
          updatedAt: area.updatedAt.toISOString(),
          action: area.action ? {
            id: area.action.id,
            serviceName: area.action.serviceName,
            actionName: area.action.actionName,
            params: area.action.params as Record<string, any>,
            connectionId: area.action.connectionId
          } : undefined,
          reaction: area.reaction ? {
            id: area.reaction.id,
            serviceName: area.reaction.serviceName,
            reactionName: area.reaction.reactionName,
            params: area.reaction.params as Record<string, any>,
            connectionId: area.reaction.connectionId
          } : undefined
        })),
        total,
        limit,
        offset
      }
    } catch (error) {
      set.status = 500
      return {
        error: "Internal Server Error",
        message: "Failed to fetch areas",
        statusCode: 500
      }
    }
  }, {
    auth: true,
    query: ListAreasQuery,
    response: {
      200: AreasListResponse,
      500: AreaErrorResponse
    },
    detail: {
      tags: ["Areas"],
      summary: "List all area",
      description: "Retrieves all automation areas for the authentificated user"
    }
  })