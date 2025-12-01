import type { ServiceType } from "../models/about.model";

export interface IParameter {
  type: "string" | "number" | "boolean" | "select" | "multiselect"
  label: string
  required: boolean
  description?: string
  default?: any
  options?: { label: string; value: any }[]
  validation?: (value: any) => boolean | string
}

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

export interface IAction {
  name: string
  description: string
  params?: Record<string, IParameter>
  check: (params: Record<string, any>, context: IContext) => Promise<boolean>
  setup?: (params: Record<string, any>, context: IContext) => Promise<void>
  teardown?: (params: Record<string, any>, context: IContext) => Promise<void>
}

export interface IReaction {
  name: string
  description: string
  params?: Record<string, IParameter>
  execute: (params: Record<string, any>, context: IContext) => Promise<void>
}

export interface IService {
  name: string
  description: string
  requiresAuth: boolean
  authType?: 'oauth2' | 'api_key' | 'none'
  oauth?: {
      authorizationUrl: string
      tokenUrl: string
      clientId: string
      clientSecret: string
      scopes: string[]
    }
  actions: IAction[]
  reactions: IReaction[]
}