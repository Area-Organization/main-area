import { prisma } from "../database/prisma"
import { serviceRegistry } from "../services/registry"
import type { IContext } from "../interfaces/service"
import { interpolate } from "../utils/interpolator"

class HookManager {
  private intervalId: Timer | null = null
  private checkIntervalMs: number = 60000

  start(intervalMs: number = 60000) {
    if (this.intervalId) {
      console.log("Hook manager already running")
      return
    }
    this.checkIntervalMs = intervalMs
    console.log(`Starting hook manager (checking every ${intervalMs / 1000}s)`)
    this.checkAllAreas()
    this.intervalId = setInterval(() => {
      this.checkAllAreas()
    }, this.checkIntervalMs)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log("Hook manager stopped")
    }
  }

  async checkAllAreas() {
    try {
      const enabledAreas = await prisma.area.findMany({
        where: { enabled: true },
        include: {
          action: true,
          reactions: true,
          user: true
        }
      })
      console.log(`Checking ${enabledAreas.length} enabled AREAs...`)
      for (const area of enabledAreas) {
        try {
          await this.checkArea(area)
        } catch (error) {
          console.error(`Error checking AREA ${area.id}:`, error)
        }
      }
    } catch (error) {
      console.error("Error in checkAllAreas:", error)
    }
  }

  private async checkArea(area: any) {
    if (!area.action || !area.reactions || area.reactions.length === 0) {
      return
    }
    const actionService = serviceRegistry.get(area.action.serviceName)
    if (!actionService) {
      console.error(`Service not found for AREA ${area.id}`)
      return
    }
    const action = actionService.actions.find((a) => a.name === area.action.actionName)
    if (!action) {
      console.error(`Action or reaction not found for AREA ${area.id}`)
      return
    }
    const actionConnection = await prisma.userConnection.findUnique({
      where: { id: area.action.connectionId }
    })
    if (!actionConnection) {
      console.error(`Action connection not found for AREA ${area.id}`)
      return
    }

    const storedParams = area.action.params as any
    const { metadata: storedMetadata, ...actionParams } = storedParams

    const actionContext: IContext = {
      userId: area.userId,
      tokens: {
        accessToken: actionConnection.accessToken || undefined,
        refreshToken: actionConnection.refreshToken || undefined,
        expiresAt: actionConnection.expiresAt?.getTime()
      },
      metadata: storedMetadata || {}
    }

    const triggered = await action.check(actionParams, actionContext)

    if (actionContext.metadata && Object.keys(actionContext.metadata).length > 0) {
      await prisma.areaAction.update({
        where: { id: area.action.id },
        data: {
          params: {
            ...actionParams,
            metadata: actionContext.metadata
          }
        }
      })
      console.log(`Updated metadata for AREA ${area.id}:`, actionContext.metadata)
    }

    if (triggered) {
      console.log(`Action triggered for AREA ${area.id}: ${area.name}`)

      await prisma.area.update({
        where: { id: area.id },
        data: {
          lastTriggered: new Date(),
          triggerCount: { increment: 1 }
        }
      })

      for (const reactionItem of area.reactions) {
        try {
          const reactionService = serviceRegistry.get(reactionItem.serviceName)
          if (!reactionService) {
            console.error(`Service not found for Reaction ${reactionItem.id}`)
            continue
          }
          const reaction = reactionService.reactions.find((r) => r.name === reactionItem.reactionName)
          if (!reaction) {
            console.error(`Reaction not found for Reaction ${reactionItem.id}`)
            continue
          }
          const reactionConnection = await prisma.userConnection.findUnique({
            where: { id: reactionItem.connectionId }
          })
          if (!reactionConnection) {
            console.error(`Reaction connection not found for Reaction ${reactionItem.id}`)
            continue
          }

          const reactionContext: IContext = {
            userId: area.userId,
            tokens: {
              accessToken: reactionConnection.accessToken || undefined,
              refreshToken: reactionConnection.refreshToken || undefined,
              expiresAt: reactionConnection.expiresAt?.getTime()
            },
            actionData: actionContext.actionData,
            metadata: {}
          }
          const reactionParamsRaw = reactionItem.params as Record<string, any>
          const processedParams = interpolate(reactionParamsRaw, actionContext.actionData || {})

          await reaction.execute(processedParams, reactionContext)
          console.log(`Reaction executed for AREA ${area.id} (${reactionItem.serviceName})`)
        } catch (error) {
          console.error(`Error executing reaction for AREA ${area.id}:`, error)
        }
      }
    }
  }
}

export const hookManager = new HookManager()
