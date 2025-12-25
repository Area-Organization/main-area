import type { IAction, IContext } from "../../../interfaces/service"

export const newStarAction: IAction = {
  name: "new_star",
  description: "Triggered when a repository receives a new star",
  params: {
    owner: {
      type: "string",
      label: "Repository Owner",
      required: true,
      description: "GitHub username or organization name"
    },
    repo: {
      type: "string",
      label: "Repository Name",
      required: true,
      description: "Name of the repository to monitor"
    }
  },
  variables: [
    { name: "previousCount", description: "Star count before trigger" },
    { name: "currentCount", description: "Current star count" },
    { name: "newStars", description: "Number of new stars gained" },
    { name: "repoName", description: "Full repository name" },
    { name: "repoUrl", description: "Link to the repository" }
  ],
  
  async check(params, context: IContext): Promise<boolean> {
    const { owner, repo } = params
    const { tokens, metadata } = context
    if (!tokens?.accessToken) {
      throw new Error("GitHub access token not found")
    }
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            "Authorization": `Bearer ${tokens.accessToken}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
          }
        }
      )
      if (!response.ok) {
        console.error(`GitHub API error: ${response.status}`)
        return false
      }
      const repoData = await response.json() as {
        stargazers_count: number
        full_name: string
        html_url: string
      }
      const currentStarCount = repoData.stargazers_count
      const lastStarCount = metadata?.starCount as number | undefined
      if (lastStarCount === undefined) {
        context.metadata = { starCount: currentStarCount }
        return false
      }
      if (currentStarCount > lastStarCount) {
        context.metadata = { starCount: currentStarCount }
        
        context.actionData = {
          previousCount: lastStarCount,
          currentCount: currentStarCount,
          newStars: currentStarCount - lastStarCount,
          repoName: repoData.full_name,
          repoUrl: repoData.html_url
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Error checking GitHub stars:", error)
      return false
    }
  },

  async setup(params, context: IContext): Promise<void> {
    const { owner, repo } = params
    const { tokens } = context
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          "Authorization": `Bearer ${tokens?.accessToken}`,
          "Accept": "application/vnd.github+json"
        }
      }
    )
    if (!response.ok) {
      throw new Error(`Cannot access repository ${owner}/${repo}`)
    }

    const repoData = await response.json() as { stargazers_count: number }
    context.metadata = { starCount: repoData.stargazers_count }
  }
}
