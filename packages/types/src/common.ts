import { t, type Static } from "elysia";

// ==========================================
// DATA TRANSFER OBJECTS (DTOs) - Schemas
// ==========================================

// Parameter Schema (For frontend rendering)
export const ParameterSchema = t.Object({
  type: t.Union([
    t.Literal("string"),
    t.Literal("number"),
    t.Literal("boolean"),
    t.Literal("select"),
    t.Literal("multiselect")
  ]),
  label: t.String(),
  required: t.Boolean(),
  description: t.Optional(t.String()),
  default: t.Optional(t.Any()),
  options: t.Optional(
    t.Array(
      t.Object({
        label: t.String(),
        value: t.Any()
      })
    )
  )
});

// Variable Schema (Data produced by the action)
export const VariableSchema = t.Object({
  name: t.String(),
  description: t.String()
});

// Action Schema (Data sent to frontend)
export const ActionSchema = t.Object({
  name: t.String(),
  description: t.String(),
  params: t.Optional(t.Record(t.String(), ParameterSchema)),
  variables: t.Optional(t.Array(VariableSchema))
});

// Reaction Schema (Data sent to frontend)
export const ReactionSchema = t.Object({
  name: t.String(),
  description: t.String(),
  params: t.Optional(t.Record(t.String(), ParameterSchema))
});

// Service Schema (Data sent to frontend)
export const ServiceSchema = t.Object({
  name: t.String(),
  description: t.String(),
  requiresAuth: t.Boolean(),
  authType: t.Optional(t.Union([t.Literal("oauth2"), t.Literal("api_key"), t.Literal("none")])),
  oauth: t.Optional(
    t.Object({
      authorizationUrl: t.String(),
      tokenUrl: t.String(),
      clientId: t.String(),
      clientSecret: t.String(),
      scopes: t.Array(t.String())
    })
  ),
  actions: t.Array(ActionSchema),
  reactions: t.Array(ReactionSchema)
});

// Static types inferred from Schemas (Shared Contract)
export type ParameterDTO = Static<typeof ParameterSchema>;
export type ActionDTO = Static<typeof ActionSchema>;
export type ReactionDTO = Static<typeof ReactionSchema>;
export type ServiceDTO = Static<typeof ServiceSchema>;
