import type { IReaction, IContext } from "../../../interfaces/service"

export const createIssueReaction: IReaction = {
  name: "create_issue",
  description: "Creates a new issue in a GitHub repository",
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
      description: "Name of the repository"
    },
    title: {
      type: "string",
      label: "Issue Title",
      required: true,
      description: "Title of the issue to create"
    },
    body: {
      type: "string",
      label: "Issue Body",
      required: false,
      description: "Description/body of the issue"
    },
    labels: {
      type: "string",
      label: "Labels",
      required: false,
      description: "Comma-separated list of labels (e.g., bug,enhancement)"
    },
    assignees: {
      type: "string",
      label: "Assignees",
      required: false,
      description: "Comma-separated list of GitHub usernames to assign"
    }
  },

  /**
   * Note: `params` are pre-interpolated by the HookManager.
   * Any template variables like `{{variableName}}` have already
   * been resolved before this function executes.
   */
  async execute(params, context: IContext): Promise<void> {
    const { owner, repo, title, body, labels, assignees } = params
    const { tokens } = context

    if (!tokens?.accessToken) {
      throw new Error("GitHub access token not found")
    }

    const issueData: any = {
      title: title,
      body: body || ""
    }

    if (labels) {
      issueData.labels = labels.split(',').map((l: string) => l.trim()).filter(Boolean)
    }
    if (assignees) {
      issueData.assignees = assignees.split(',').map((a: string) => a.trim()).filter(Boolean)
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokens.accessToken}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(issueData)
        }
      )

      if (!response.ok) {
        const error = await response.json() as { message?: string }
        throw new Error(`Failed to create issue: ${error.message || response.statusText}`)
      }

      const createdIssue = await response.json() as { html_url: string }
      console.log(`✓ Issue created: ${createdIssue.html_url}`)
    } catch (error) {
      console.error("Error creating GitHub issue:", error)
      throw error
    }
  }
}
