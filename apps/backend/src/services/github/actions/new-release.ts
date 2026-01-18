import type { IAction, IContext } from "../../../interfaces/service"

interface GitHubRelease {
  id: number
  tag_name: string
  name: string
}

export const newReleaseAction: IAction = {
  name: "New release",
  description: "Triggered when a new release is published to a repo.",
  params: {
    owner: { type: "string", label: "Owner", required: true },
    repo: { type: "string", label: "Repository", required: true }
  },
  variables: [
    { name: "tagName", description: "The tag's name (ex: v1.0.0)" },
    { name: "releaseName", description: "The release's title" }
  ],
  async check(params, context: IContext): Promise<boolean> {
    try {
      const res = await fetch(`https://api.github.com/repos/${params.owner}/${params.repo}/releases/latest`, {
        headers: {
          Authorization: `Bearer ${context.tokens?.accessToken}`,
          "Accept": "application/vnd.github+json"
        }
      })

      if (!res.ok) return false

      const data = (await res.json()) as GitHubRelease

      if (context.metadata?.lastReleaseId === data.id) {
        return false
      }

      context.metadata = { lastReleaseId: data.id }
      context.actionData = { 
        tagName: data.tag_name, 
        releaseName: data.name || data.tag_name 
      }
      return true
    } catch (error) {
      console.error("GitHub Release check error:", error)
      return false
    }
  }
}