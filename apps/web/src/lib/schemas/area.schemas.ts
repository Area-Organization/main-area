import { Type } from "@sinclair/typebox";

export const createAreaSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  action: Type.Object({
    serviceName: Type.String(),
    actionName: Type.String(),
    params: Type.Record(Type.String(), Type.Any())
  }),
  reaction: Type.Object({
    serviceName: Type.String(),
    reactionName: Type.String(),
    params: Type.Record(Type.String(), Type.Any())
  })
});
