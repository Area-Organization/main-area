import type { IReaction, IContext } from "../../../interfaces/service"

export const createPageInDbReaction: IReaction = {
  name: "Create page in database",
  description: "Creates a new page (entry) in a specific Notion database.",
  params: {
    databaseId: {
      type: "string",
      label: "Database ID",
      required: true,
      description: "The ID of the database where the page will be created."
    },
    title: {
      type: "string",
      label: "Page Title",
      required: true,
      description: "The title of the new page. This will fill the 'Title' property of the database."
    },
    content: {
      type: "string",
      label: "Page Content (Optional)",
      required: false,
      description: "Simple text content to add to the body of the page."
    }
  },

  async execute(params, context: IContext): Promise<void> {
    const { databaseId, title, content } = params
    const accessToken = context.tokens?.accessToken

    if (!accessToken) {
      throw new Error("Notion access token not found.")
    }

    const body: any = {
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [{ text: { content: title } }]
        }
      }
    }

    if (content) {
      body.children = [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: content } }]
          }
        }
      ]
    }

    try {
      const response = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create Notion page: ${errorText}`)
      }

      console.log(`✓ Notion page '${title}' created successfully.`)
    } catch (error) {
      console.error("Error creating Notion page:", error)
      throw error
    }
  }
}