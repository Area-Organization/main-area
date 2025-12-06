import { type IService } from "../interfaces/service"

class ServiceRegistry {
  private services: Map<string, IService> = new Map()

  register(service: IService): void {
    this.services.set(service.name, service)
  }

  get(name: string): IService | undefined {
    return this.services.get(name)
  }

  getAll(): IService[] {
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
