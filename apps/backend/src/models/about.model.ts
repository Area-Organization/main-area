import { t, type Static } from "elysia"

const Parameters = t.Optional(t.Record(t.String(), t.Any()))

export const Action = t.Object({
  name: t.String(),
  description: t.String(),
  params: Parameters,
})

export const Reaction = t.Object({
  name: t.String(),
  description: t.String(),
  params: Parameters,
})

export const Service = t.Object({
  name: t.String(),
  description: t.String(),

  requiresAuth: t.Boolean(),
    authType: t.Optional(t.Union([
      t.Literal('oauth2'),
      t.Literal('api_key'),
      t.Literal('none')
    ])),

  actions: t.Array(Action),
  reactions: t.Array(Reaction),
})
export const Client = t.Object({
  host: t.String({ description: "IP address of the client" }),
})

export const Server = t.Object({
  current_time: t.Integer({ description: "Unix timestamp" }),
  services: t.Array(Service)
})

export const AboutResponse = t.Object({
  client: Client,
  server: Server,
})

export type ActionType = Static<typeof Action>
export type ReactionType = Static<typeof Reaction>
export type ServiceType = Static<typeof Service>
export type AboutResponseType = Static<typeof AboutResponse>