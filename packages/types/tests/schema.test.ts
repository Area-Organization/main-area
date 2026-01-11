import { describe, expect, it } from "bun:test";
import { CreateAreaBody } from "../src/area";
import { Value } from "@sinclair/typebox/value";

describe("Shared Types", () => {
  it("validates correct CreateAreaBody", () => {
    const validBody = {
      name: "Test Area",
      description: "A test description",
      action: {
        serviceName: "github",
        actionName: "new_issue",
        params: { repo: "test" },
        connectionId: "conn_123"
      },
      reaction: {
        serviceName: "discord",
        reactionName: "send_message",
        params: { channel: "general" },
        connectionId: "conn_456"
      }
    };

    const isValid = Value.Check(CreateAreaBody, validBody);
    expect(isValid).toBe(true);
  });

  it("invalidates missing required fields", () => {
    const invalidBody = {
      name: "Test Area"
      // missing action/reaction
    };

    const isValid = Value.Check(CreateAreaBody, invalidBody);
    expect(isValid).toBe(false);
  });
});
