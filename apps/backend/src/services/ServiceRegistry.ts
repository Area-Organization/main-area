import { type IService } from "../interfaces/service"
import { githubService } from "./github"
import { gmailService } from "./gmail"
import { discordService } from "./discord"
import { trelloService } from "./trello"
import { spotifyService } from "./spotify"
import { youtubeService } from "./youtube"
import { googleDriveService } from "./drive"
import { notionService } from "./notion"

export class ServiceRegistry {
  private services: Map<string, IService> = new Map()

  constructor() {
    this.register(githubService)
    this.register(gmailService)
    this.register(discordService)
    this.register(trelloService)
    this.register(spotifyService)
    this.register(youtubeService)
    this.register(googleDriveService)
    this.register(notionService)
  }

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
    return service?.actions.find((a) => a.name === actionName)
  }

  getReaction(serviceName: string, reactionName: string) {
    const service = this.services.get(serviceName)
    return service?.reactions.find((r) => r.name === reactionName)
  }
}
