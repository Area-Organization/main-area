import { describe, expect, it } from "bun:test"
import { ServiceRegistry } from "../../src/services/ServiceRegistry"

// Instantiate a fresh registry for testing logic
const serviceRegistry = new ServiceRegistry()

describe("Service Registry", () => {
  it("initializes with default services (GitHub, Gmail)", () => {
    const services = serviceRegistry.getAll()
    // We expect at least github and gmail for now
    expect(services.length).toBeGreaterThanOrEqual(2)

    const serviceNames = services.map((s) => s.name)
    expect(serviceNames).toContain("github")
    expect(serviceNames).toContain("gmail")
  })

  it("retrieves a service by name", () => {
    const service = serviceRegistry.get("github")
    expect(service).toBeDefined()
    expect(service?.name).toBe("github")
    expect(service?.actions).toBeDefined()
    expect(service?.reactions).toBeDefined()
  })

  it("returns undefined for non-existent service", () => {
    const service = serviceRegistry.get("invalid_service_name")
    expect(service).toBeUndefined()
  })

  it("retrieves a valid action from a service", () => {
    const action = serviceRegistry.getAction("github", "New issue")
    expect(action).toBeDefined()
    expect(action?.name).toBe("New issue")
  })

  it("returns undefined for invalid action in valid service", () => {
    const action = serviceRegistry.getAction("github", "non_existent_action")
    expect(action).toBeUndefined()
  })

  it("returns undefined for action in invalid service", () => {
    const action = serviceRegistry.getAction("invalid_service", "any_action")
    expect(action).toBeUndefined()
  })

  it("retrieves a valid reaction from a service", () => {
    const reaction = serviceRegistry.getReaction("gmail", "Send email")
    expect(reaction).toBeDefined()
    expect(reaction?.name).toBe("Send email")
  })

  it("returns undefined for invalid reaction", () => {
    const reaction = serviceRegistry.getReaction("gmail", "make_coffee")
    expect(reaction).toBeUndefined()
  })
})
