import type { IAction, IContext } from "../../../interfaces/service"

type NotionPage = {
  id: string
  created_time: string
  url: string
  properties: Record<string, any>
}

type NotionDatabaseQueryResponse = {
  results: NotionPage[]
}

const getTitleValue = (page: NotionPage): string => {
  const titleProp = Object.values(page.properties).find((prop) => prop.type === "title")
  return titleProp?.title[0]?.plain_text || "Untitled"
}

export const newPageInDbAction: IAction = {
  name: "New page in database",
  description: "Triggered when a new page is added to a Notion database.",
  params: {
    databaseId: {
      type: "string",
      label: "Database ID",
      required: true,
      description: "The ID of the Notion database to monitor."
    }
  },
  variables: [
    { name: "pageId", description: "The ID of the new page" },
    { name: "pageUrl", description: "The URL of the new page" },
    { name: "title", description: "The title of the new page" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { databaseId } = params
    const accessToken = context.tokens?.accessToken

    if (!accessToken) {
      throw new Error("Notion access token not found.")
    }

    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sorts: [{ timestamp: "created_time", direction: "descending" }],
          page_size: 1
        })
      })

      if (!response.ok) {
        console.error(`Notion API Error: ${response.status} - ${await response.text()}`)
        return false
      }

      const data = (await response.json()) as NotionDatabaseQueryResponse
      const latestPage = data.results[0]

      if (!latestPage) {
        return false
      }

      const lastCheckedId = context.metadata?.lastPageId as string | undefined

      if (lastCheckedId === undefined) {
        context.metadata = { lastPageId: latestPage.id }
        return false
      }

      if (latestPage.id !== lastCheckedId) {
        context.metadata = { lastPageId: latestPage.id }
        context.actionData = {
          pageId: latestPage.id,
          pageUrl: latestPage.url,
          title: getTitleValue(latestPage)
        }
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking Notion database:", error)
      return false
    }
  }
}