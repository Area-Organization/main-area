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
  
  async execute(params, context: IContext): Promise<void> {
    const { owner, repo, title, body, labels, assignees } = params
    const { tokens, actionData } = context
    if (!tokens?.accessToken) {
      throw new Error("GitHub access token not found")
    }
    let processedTitle = title
    let processedBody = body || ""
    if (actionData) {
      const replacements: Record<string, any> = {
        '{{title}}': actionData.title,
        '{{author}}': actionData.author,
        '{{url}}': actionData.url,
        '{{issueNumber}}': actionData.issueNumber,
        '{{body}}': actionData.body,
        '{{repoName}}': actionData.repoName,
        '{{newStars}}': actionData.newStars,
        '{{currentCount}}': actionData.currentCount
      }
      for (const [placeholder, value] of Object.entries(replacements)) {
        if (value !== undefined) {
          processedTitle = processedTitle.replace(new RegExp(placeholder, 'g'), String(value))
          processedBody = processedBody.replace(new RegExp(placeholder, 'g'), String(value))
        }
      }
    }
    const issueData: any = {
      title: processedTitle,
      body: processedBody
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