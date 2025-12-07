import { t, type Static } from "elysia"

export const UserConnectionSchema = t.Object({
  id: t.String(),
  serviceName: t.String(),
  expiresAt: t.Optional(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
  metadata: t.Optional(t.Record(t.String(), t.Any()))
})

export const CreateConnectionBody = t.Object({
  serviceName: t.String(),
  accessToken: t.Optional(t.String()),
  refreshToken: t.Optional(t.String()),
  expiresAt: t.Optional(t.String()),
  metadata: t.Optional(t.Record(t.String(), t.Any()))
})

export const OAuth2CallbackBody = t.Object({
  serviceName: t.String(),
  code: t.String(),
  state: t.Optional(t.String())
})

export const UpdateConnectionBody = t.Object({
  accessToken: t.Optional(t.String()),
  refreshToken: t.Optional(t.String()),
  expiresAt: t.Optional(t.String()),
  metadata: t.Optional(t.Record(t.String(), t.Any()))
})
 
export const ConnectionResponse = t.Object({
  connection: UserConnectionSchema
})

export const ConnectionsListResponse = t.Object({
  connections: t.Array(UserConnectionSchema),
  total: t.Number()
})

export const ConnectionDeletedResponse = t.Object({
  message: t.String(),
  connectionId: t.String()
})

export const OAuth2AuthUrlResponse = t.Object({
  authUrl: t.String(),
  state: t.String()
})

export const ConnectionErrorResponse = t.Object({
  error: t.String(),
  message: t.String(),
  statusCode: t.Number()
})

export const OAuth2TokenResponse = t.Object({
  access_token: t.String(),
  refresh_token: t.Optional(t.String()),
  expires_in: t.Optional(t.Number()),
  token_type: t.Optional(t.String()),
  scope: t.Optional(t.String())
})

export type UserConnectionSchemaType = Static<typeof UserConnectionSchema>
export type OAuth2TokenResponseType = Static<typeof OAuth2TokenResponse>
export type CreateConnectionBodyType = Static<typeof CreateConnectionBody>
export type OAuth2CallbackBodyType = Static<typeof OAuth2CallbackBody>
export type UpdateConnectionBodyType = Static<typeof UpdateConnectionBody>
export type ConnectionResponseType = Static<typeof ConnectionResponse>
export type ConnectionsListResponseType = Static<typeof ConnectionsListResponse>
export type ConnectionDeletedResponseType = Static<typeof ConnectionDeletedResponse>
export type OAuth2AuthUrlResponseType = Static<typeof OAuth2AuthUrlResponse>
export type ConnectionErrorResponseType = Static<typeof ConnectionErrorResponse>