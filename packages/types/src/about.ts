import { t, type Static } from "elysia";
import { ServiceSchema } from "./common";

export const Client = t.Object({
  host: t.String({ description: "IP address of the client" })
});

export const Server = t.Object({
  current_time: t.Integer({ description: "Unix timestamp" }),
  services: t.Array(ServiceSchema)
});

export const AboutResponse = t.Object({
  client: Client,
  server: Server
});

export type AboutResponseType = Static<typeof AboutResponse>;
