import type { IAction, IContext } from "../../../interfaces/service"

export const newEmailAction: IAction = {
  name: "new_email",
  description: "Triggered when a new email is received",
  params: {
    from: {
      type: "string",
      label: "From (optional)",
      required: false,
      description: "Filter by sender email address"
    },
    subject: {
      type: "string",
      label: "Subject contains (optional)",
      required: false,
      description: "Filter by subject keywords"
    },
    label: {
      type: "string",
      label: "Label (optional)",
      required: false,
      description: "Filter by Gmail label (e.g., INBOX, IMPORTANT)"
    }
  },
  variables: [
    { name: "messageId", description: "ID of the email message" },
    { name: "from", description: "Sender address" },
    { name: "subject", description: "Subject line" },
    { name: "snippet", description: "Short preview of the email body" },
    { name: "date", description: "Date received" },
    { name: "attachmentCount", description: "Number of attachments" },
    { name: "firstAttachmentName", description: "Name of the first attachment" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { from, subject, label } = params
    const { tokens, metadata } = context

    if (!tokens?.accessToken) {
      throw new Error("Gmail access token not found")
    }
    try {
      let query = "is:unread"
      if (from) query += ` from:${from}`
      if (subject) query += ` subject:${subject}`
      if (label) query += ` label:${label}`
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
        messages?: Array<{ id: string; threadId: string }>
        resultSizeEstimate: number
      }
      if (!data.messages || data.messages.length === 0) {
        return false
      }
      const latestMessage = data.messages[0]
      if (!latestMessage) {
        return false
      }
      const latestMessageId = latestMessage.id
      const lastCheckedId = metadata?.lastEmailId as string | undefined
      if (lastCheckedId === undefined) {
        context.metadata = { lastEmailId: latestMessageId }
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
            parts?: Array<{ filename: string }>
          }
        }
        const headers = messageData.payload.headers
        const fromHeader = headers.find(h => h.name.toLowerCase() === "from")?.value || "Unknown"
        const subjectHeader = headers.find(h => h.name.toLowerCase() === "subject")?.value || "No Subject"
        const dateHeader = headers.find(h => h.name.toLowerCase() === "date")?.value || new Date().toISOString()
        const attachments = messageData.payload.parts?.filter(p => p.filename) || []
        context.metadata = { lastEmailId: latestMessageId }
        context.actionData = {
          messageId: latestMessageId,
          from: fromHeader,
          subject: subjectHeader,
          snippet: messageData.snippet,
          date: dateHeader,
          attachmentCount: attachments.length,
          firstAttachmentName: attachments[0]?.filename
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Error checking Gmail:", error)
      return false
    }
  }
}
