import { describe, expect, it } from "bun:test"
import { interpolate } from "../../src/utils/interpolator"

describe("Interpolator Utility", () => {
  it("replaces simple variables in string", () => {
    const template = "Hello {{name}}!"
    const variables = { name: "World" }
    expect(interpolate(template, variables)).toBe("Hello World!")
  })

  it("handles deep object interpolation", () => {
    const template = {
      subject: "New issue: {{issueTitle}}",
      body: "Created by {{author}}"
    }
    const variables = { issueTitle: "Bug Fix", author: "Dev" }
    const result = interpolate(template, variables)

    expect(result.subject).toBe("New issue: Bug Fix")
    expect(result.body).toBe("Created by Dev")
  })

  it("leaves unmatched placeholders as is", () => {
    const template = "Hello {{missing}}"
    const variables = { name: "World" }
    expect(interpolate(template, variables)).toBe("Hello {{missing}}")
  })
})
