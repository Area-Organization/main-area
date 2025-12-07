import type { ActionDTO, ReactionDTO, ServiceDTO } from "@area/types"

export interface IContext {
  userId: string
  tokens?: {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
  actionData?: Record<string, any>
  metadata?: Record<string, any>
}

export interface IAction extends ActionDTO {
  check: (params: Record<string, any>, context: IContext) => Promise<boolean>
  setup?: (params: Record<string, any>, context: IContext) => Promise<void>
  teardown?: (params: Record<string, any>, context: IContext) => Promise<void>
}

export interface IReaction extends ReactionDTO {
  execute: (params: Record<string, any>, context: IContext) => Promise<void>
}

export interface IService extends Omit<ServiceDTO, "actions" | "reactions"> {
  actions: IAction[]
  reactions: IReaction[]
}
