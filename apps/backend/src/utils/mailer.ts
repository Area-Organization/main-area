import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789")

export const mailer = {
  sendVerificationCode: async (email: string, otp: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "AREA <noreply@epi-area.me>",
        to: email,
        subject: `${otp} est votre code de vérification`,
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9;">
            <div style="max-width: 400px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #eeeeee;">
              <h1 style="color: #333333; font-size: 24px;">Vérifiez votre email</h1>
              <p style="color: #666666; font-size: 16px;">Voici votre code de vérification pour AREA :</p>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; margin: 30px 0; color: #7033ff; padding: 10px; background-color: #f4f0ff; border-radius: 5px;">
                ${otp}
              </div>
              <p style="color: #999999; font-size: 12px;">Ce code expirera dans 10 minutes.</p>
            </div>
          </div>
        `
      })
      if (error) {
        console.error("[MAILER ERROR]", error)
        return { success: false, error }
      }
      return { success: true, data }
    } catch (err) {
      console.error("[MAILER FATAL ERROR]", err)
      return { success: false, error: err }
    }
  }
}
