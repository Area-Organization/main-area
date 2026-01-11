import { Type } from "@sinclair/typebox";

export const loginSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
  rememberMe: Type.Optional(Type.Boolean({ default: false }))
});

export const registrationSchema = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
  confirmPassword: Type.String({ minLength: 8 })
});
