import { describe, expect, it } from "bun:test"
import { interpolate } from "../../src/utils/interpolator"

describe("Interpolator Utility", () => {
  it("replaces simple string variables", () => {
    const template = "Hello {{name}}!"
    const variables = { name: "World" }
    expect(interpolate(template, variables)).toBe("Hello World!")
  })

  it("handles whitespace inside curly braces", () => {
    const template = "Hello {{  name  }}!"
    const variables = { name: "World" }
    expect(interpolate(template, variables)).toBe("Hello World!")
  })

  it("replaces multiple variables in one string", () => {
    const template = "{{greeting}} {{name}}"
    const variables = { greeting: "Hi", name: "User" }
    expect(interpolate(template, variables)).toBe("Hi User")
  })

  it("converts non-string variables to string", () => {
    const template = "Count: {{count}}"
    const variables = { count: 42 }
    expect(interpolate(template, variables)).toBe("Count: 42")
  })

  it("leaves unmatched placeholders as is (missing variable)", () => {
    const template = "Hello {{missing}}"
    const variables = { name: "World" }
    expect(interpolate(template, variables)).toBe("Hello {{missing}}")
  })

  it("handles nested object interpolation", () => {
    const template = {
      meta: {
        title: "Issue: {{issueTitle}}",
        author: {
          name: "{{authorName}}"
        }
      }
    }
    const variables = { issueTitle: "Bug Fix", authorName: "Dev" }
    const result = interpolate(template, variables)

    expect(result.meta.title).toBe("Issue: Bug Fix")
    expect(result.meta.author.name).toBe("Dev")
  })

  it("handles interpolation within arrays", () => {
    const template = ["{{val1}}", "static", "{{val2}}"]
    const variables = { val1: "A", val2: "B" }
    const result = interpolate(template, variables)

    expect(result).toEqual(["A", "static", "B"])
  })

  it("handles deep complex structures (Objects inside Arrays)", () => {
    const template = {
      list: [
        { id: "{{id1}}", name: "Item 1" },
        { id: "{{id2}}", name: "Item 2" }
      ]
    }
    const variables = { id1: "123", id2: "456" }
    const result = interpolate(template, variables)

    expect(result.list[0].id).toBe("123")
    expect(result.list[1].id).toBe("456")
  })

  it("returns null or non-object types as is", () => {
    expect(interpolate(null, {})).toBe(null)
    expect(interpolate(123, {})).toBe(123)
    expect(interpolate(true, {})).toBe(true)
  })

  it("does not mutate the original object", () => {
    const template = { key: "{{val}}" }
    const variables = { val: "test" }
    const result = interpolate(template, variables)

    expect(result.key).toBe("test")
    expect(template.key).toBe("{{val}}")
  })
})
