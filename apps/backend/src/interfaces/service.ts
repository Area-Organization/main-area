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

// Extends DTO with backend-only logic
export interface IAction extends ActionDTO {
  check: (params: Record<string, any>, context: IContext) => Promise<boolean>
  setup?: (params: Record<string, any>, context: IContext) => Promise<void>
  teardown?: (params: Record<string, any>, context: IContext) => Promise<void>
}

// Extends DTO with backend-only logic
export interface IReaction extends ReactionDTO {
  execute: (params: Record<string, any>, context: IContext) => Promise<void>
}

// Extends DTO, overriding actions/reactions with Logic versions
export interface IService extends Omit<ServiceDTO, "actions" | "reactions"> {
  actions: IAction[]
  reactions: IReaction[]
}
