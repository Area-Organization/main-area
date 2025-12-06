import { t, type Static } from "elysia"

export const AreaStatus = t.Union([
  t.Literal('active'),
  t.Literal('inactive'),
  t.Literal('error')
])

export const ActionParams = t.Record(t.String(), t.Any())
export const ReactionParams = t.Record(t.String(), t.Any())

export const AreaActionSchema = t.Object({
  id: t.String(),
  serviceName: t.String(),
  actionName: t.String(),
  params: ActionParams,
  connectionId: t.String()
})

export const AreaReactionSchema = t.Object({
  id: t.String(),
  serviceName: t.String(),
  reactionName: t.String(),
  params: ReactionParams,
  connectionId: t.String()
})

export const AreaSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.Optional(t.String()),
  enabled: t.Boolean(),
  lastTriggered: t.Optional(t.String()),
  triggerCount: t.Number(),
  createdAt: t.String(),
  updatedAt: t.String(),
  action: t.Optional(AreaActionSchema),
  reaction: t.Optional(AreaReactionSchema)
})

export const CreateAreaBody = t.Object({
  name: t.String(),
  description: t.Optional(t.String({ maxLength: 500 })),
  action: t.Object({
    serviceName: t.String(),
    actionName: t.String(),
    params: ActionParams,
    connectionId: t.String()
  }),
  reaction: t.Object({
    serviceName: t.String(),
    reactionName: t.String(),
    params: ReactionParams,
    connectionId: t.String()
  })
})

export const UpdateAreaBody = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.String({ maxLength: 500 })),
  enabled: t.Optional(t.Boolean()),
  action: t.Optional(t.Object({
    serviceName: t.String(),
    actionName: t.String(),
    params: ActionParams,
    connectionId: t.String()
  })),
  reaction: t.Optional(t.Object({
    serviceName: t.String(),
    reactionName: t.String(),
    params: ReactionParams,
    connectionId: t.String()
  }))
})

export const ListAreasQuery = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Numeric({ minimum: 0, default: 0 })),
  enabled: t.Optional(t.Boolean()),
  search: t.Optional(t.String())
})

export const AreaResponse = t.Object({
  area: AreaSchema
})

export const AreasListResponse = t.Object({
  areas: t.Array(AreaSchema),
  total: t.Number(),
  limit: t.Number(),
  offset: t.Number()
})

export const AreaDeletedResponse = t.Object({
  message: t.String(),
  enabled: t.Boolean()
})

export const AreaToggleResponse = t.Object({
  message: t.String(),
  enabled: t.Boolean()
})

export const AreaStatsResponse = t.Object({
  totalAreas: t.Number(),
  activeAreas: t.Number(),
  inactiveAreas: t.Number(),
  totalTriggers: t.Number(),
  recentlyTriggered: t.Array(t.Object({
    id: t.String(),
    name: t.String(),
    triggeredAt: t.String()
  }))
})

export const AreaErrorResponse = t.Object({
  error: t.String(),
  message: t.String(),
  statusCode: t.Number()
})

export type AreaStatusType = Static<typeof AreaStatus>
export type AreaActionType = Static<typeof AreaActionSchema>
export type AreaReactionType = Static<typeof AreaReactionSchema>
export type AreaType = Static<typeof AreaSchema>
export type CreateAreaBodyType = Static<typeof CreateAreaBody>
export type UpdateAreaType = Static<typeof UpdateAreaBody>
export type ListAreasQueryType = Static<typeof ListAreasQuery>
export type AreaResponseType = Static<typeof AreaResponse>
export type AreasListResponseType = Static<typeof AreasListResponse>
export type AreaDeletedResponseType = Static<typeof AreaDeletedResponse>
export type AreaToggleResponseType = Static<typeof AreaToggleResponse>
export type AreaStatsResponseType = Static<typeof AreaStatsResponse>
export type AreaErrorResponseType = Static<typeof AreaErrorResponse>
