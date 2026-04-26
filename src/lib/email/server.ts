import nodemailer, { type Transporter } from "nodemailer"

let cachedTransporter: Transporter | null = null

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT ?? 465)

  if (!host || !user || !pass) {
    throw new Error("Configurazione SMTP mancante")
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
  return cachedTransporter
}

export type SendMailOptions = {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendMail(options: SendMailOptions) {
  const transporter = getTransporter()
  const fromName = process.env.MAIL_FROM_NAME ?? "TriviaMore"
  const fromAddress = process.env.SMTP_USER!

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  })
}
