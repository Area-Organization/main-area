import type { IReaction, IContext } from "../../../interfaces/service"

export const sendEmailReaction: IReaction = {
  name: "Send email",
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

  /**
   * Note: All params (`to`, `subject`, `body`, `replyTo`) are pre-interpolated
   * by the HookManager before this function executes. Any template variables
   * like `{{variableName}}` have already been resolved by that point.
   */
  async execute(params, context: IContext): Promise<void> {
    const { to, subject, body, replyTo } = params
    const { tokens } = context

    if (!tokens?.accessToken) {
      throw new Error("Gmail access token not found")
    }

    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      `MIME-Version: 1.0`
    ]

    if (replyTo) {
      emailLines.push(`Reply-To: ${replyTo}`)
    }

    emailLines.push("", body)

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
      
      // Success
    } catch (error) {
      throw error
    }
  }
}
