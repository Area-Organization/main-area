import type { IAction, IContext } from "../../../interfaces/service"

export const newIssueAction: IAction = {
  name: "new_issue",
  description: "Triggered when a new issue is created in a repository",
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

  async check(params, context: IContext): Promise<boolean> {
    const { owner, repo } = params
    const { tokens, metadata } = context

    if (!tokens?.accessToken) {
      throw new Error("GitHub access token not found")
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&sort=created&direction=desc&per_page=1`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      })

      if (!response.ok) {
        console.error(`GitHub API error: ${response.status}`)
        return false
      }

      const issues = await response.json()

      if (!Array.isArray(issues) || issues.length === 0) {
        return false
      }

      const latestIssue = issues[0]
      const lastCheckedId = metadata?.lastIssueId as number | undefined

      if (lastCheckedId === undefined) {
        context.metadata = { lastIssueId: latestIssue.id }
        return false
      }

      if (latestIssue.id !== lastCheckedId) {
        context.metadata = { lastIssueId: latestIssue.id }

        context.actionData = {
          issueNumber: latestIssue.number,
          title: latestIssue.title,
          body: latestIssue.body,
          url: latestIssue.html_url,
          author: latestIssue.user.login,
          createdAt: latestIssue.created_at
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Error checking GitHub issues:", error)
      return false
    }
  },

  async setup(params, context: IContext): Promise<void> {
    const { owner, repo } = params
    const { tokens } = context

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${tokens?.accessToken}`,
        Accept: "application/vnd.github+json"
      }
    })

    if (!response.ok) {
      throw new Error(`Cannot access repository ${owner}/${repo}`)
    }

    const issuesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?per_page=1`, {
      headers: {
        Authorization: `Bearer ${tokens?.accessToken}`,
        Accept: "application/vnd.github+json"
      }
    })

    if (issuesResponse.ok) {
      const issues = await issuesResponse.json()
      if (issues.length > 0) {
        context.metadata = { lastIssueId: issues[0].id }
      }
    }
  }
}
