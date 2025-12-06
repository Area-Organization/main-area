import { type ServiceType } from "../models/about.model"

class ServiceRegistry {
  private services: Map<string, ServiceType> = new Map()

  register(service: ServiceType): void {
    this.services.set(service.name, service)
  }

  get(name: string): ServiceType | undefined {
    return this.services.get(name)
  }

  getAll(): ServiceType[] {
    return Array.from(this.services.values())
  }

  getAction(serviceName: string, actionName: string) {
    const service = this.services.get(serviceName)
    return service?.actions.find(a => a.name === actionName)
  }

  getReaction(serviceName: string, reactionName: string) {
    const service = this.services.get(serviceName)
    return service?.reactions.find(r => r.name === reactionName)
  }
}

export const serviceRegistry = new ServiceRegistry()
