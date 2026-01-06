import type { IAction, IContext } from "../../../interfaces/service"

export const newEmailWithAttachmentAction: IAction = {
  name: "New email with attachment",
  description: "Triggered when a new email with attachment is received",
  params: {
    fileExtension: {
      type: "string",
      label: "File Extension (optional)",
      required: false,
      description: "Filter by attachment extension (e.g., pdf, jpg, xlsx)"
    },
    from: {
      type: "string",
      label: "From (optional)",
      required: false,
      description: "Filter by sender email address"
    }
  },
  variables: [
    { name: "messageId", description: "ID of the email message" },
    { name: "from", description: "Sender address" },
    { name: "subject", description: "Subject line" },
    { name: "snippet", description: "Short preview of the email body" },
    { name: "attachmentCount", description: "Number of attachments" },
    { name: "firstAttachmentName", description: "Name of the first attachment" },
    { name: "attachments", description: "List of attachments" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { fileExtension, from } = params
    const { tokens, metadata } = context
    if (!tokens?.accessToken) {
      throw new Error("Gmail access token not found")
    }
    try {
      let query = "has:attachment is:unread"
      if (from) query += ` from:${from}`
      if (fileExtension) query += ` filename:${fileExtension}`
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=1`,
        {
          headers: {
            "Authorization": `Bearer ${tokens.accessToken}`,
            "Accept": "application/json"
          }
        }
      )
      if (!response.ok) {
        console.error(`Gmail API error: ${response.status}`)
        return false
      }
      const data = await response.json() as {
        messages?: Array<{ id: string }>
      }
      if (!data.messages || data.messages.length === 0) {
        return false
      }
      const latestMessage = data.messages[0]
      if (!latestMessage) {
        return false
      }
      const latestMessageId = latestMessage.id
      const lastCheckedId = metadata?.lastAttachmentEmailId as string | undefined
      if (lastCheckedId === undefined) {
        context.metadata = { lastAttachmentEmailId: latestMessageId }
        return false
      }
      if (latestMessageId !== lastCheckedId) {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${latestMessageId}`,
          {
            headers: {
              "Authorization": `Bearer ${tokens.accessToken}`,
              "Accept": "application/json"
            }
          }
        )
        if (!messageResponse.ok) {
          return false
        }
        const messageData = await messageResponse.json() as {
          id: string
          snippet: string
          payload: {
            headers: Array<{ name: string; value: string }>
            parts?: Array<{ 
              filename: string
              mimeType: string
              body: { attachmentId: string; size: number }
            }>
          }
        }
        const headers = messageData.payload.headers
        const fromHeader = headers.find(h => h.name.toLowerCase() === "from")?.value || "Unknown"
        const subjectHeader = headers.find(h => h.name.toLowerCase() === "subject")?.value || "No Subject"
        const attachments = messageData.payload.parts?.filter(p => p.filename && p.body?.attachmentId) || []
        const attachmentsList = attachments.map(a => ({
          filename: a.filename,
          mimeType: a.mimeType,
          size: a.body.size
        }))
        context.metadata = { lastAttachmentEmailId: latestMessageId }
        context.actionData = {
          messageId: latestMessageId,
          from: fromHeader,
          subject: subjectHeader,
          snippet: messageData.snippet,
          attachmentCount: attachments.length,
          attachments: attachmentsList,
          firstAttachmentName: attachments[0]?.filename
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Error checking Gmail attachments:", error)
      return false
    }
  }
}
