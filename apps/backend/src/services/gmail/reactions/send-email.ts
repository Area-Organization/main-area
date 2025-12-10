import type { IReaction, IContext } from "../../../interfaces/service"

export const sendEmailReaction: IReaction = {
  name: "send_email",
  description: "Sends an email via Gmail",
  params: {
    to: {
      type: "string",
      label: "To",
      required: true,
      description: "Recipient email address"
    },
    subject: {
      type: "string",
      label: "Subject",
      required: true,
      description: "Email subject line"
    },
    body: {
      type: "string",
      label: "Body",
      required: true,
      description: "Email body (supports templates)"
    },
    replyTo: {
      type: "string",
      label: "Reply To",
      required: false,
      description: "Reply-to email address (optional)"
    }
  },
  
  async execute(params, context: IContext): Promise<void> {
    const { to, subject, body, replyTo } = params
    const { tokens, actionData } = context
    if (!tokens?.accessToken) {
      throw new Error("Gmail access token not found")
    }
    let processedSubject = subject as string
    let processedBody = body as string
    if (actionData) {
      const replacements: Record<string, any> = {
        '{{title}}': actionData.title,
        '{{author}}': actionData.author,
        '{{url}}': actionData.url,
        '{{issueNumber}}': actionData.issueNumber,
        '{{repoName}}': actionData.repoName,
        '{{newStars}}': actionData.newStars,
        '{{body}}': actionData.body,
        // Gmail
        '{{from}}': actionData.from,
        '{{subject}}': actionData.subject,
        '{{snippet}}': actionData.snippet,
        '{{messageId}}': actionData.messageId,
        '{{attachmentCount}}': actionData.attachmentCount,
        '{{firstAttachmentName}}': actionData.firstAttachmentName,
      }
      for (const [placeholder, value] of Object.entries(replacements)) {
        if (value !== undefined) {
          const strValue = String(value)
          processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), strValue)
          processedBody = processedBody.replace(new RegExp(placeholder, 'g'), strValue)
        }
      }
    }
    const emailLines = [
      `To: ${to}`,
      `Subject: ${processedSubject}`,
      `Content-Type: text/plain; charset=utf-8`,
      `MIME-Version: 1.0`
    ]
    if (replyTo) {
      emailLines.push(`Reply-To: ${replyTo}`)
    }
    emailLines.push("", processedBody)
    const email = emailLines.join("\r\n")
    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
    try {
      const response = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokens.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            raw: encodedEmail
          })
        }
      )
      if (!response.ok) {
        const error = await response.json() as { error?: { message?: string } }
        throw new Error(`Failed to send email: ${error.error?.message || response.statusText}`)
      }
      const sentMessage = await response.json() as { id: string; threadId: string }
    } catch (error) {
      throw error
    }
  }
}