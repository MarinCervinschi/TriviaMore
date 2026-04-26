import type { ContactInput } from "@/lib/browse/contact-schema"

const TYPE_META: Record<
  ContactInput["type"],
  { label: string; color: string; bg: string }
> = {
  bug: { label: "Bug", color: "#dc2626", bg: "#fee2e2" },
  feature: { label: "Funzionalita'", color: "#d97706", bg: "#fef3c7" },
  content: { label: "Contenuti", color: "#2563eb", bg: "#dbeafe" },
  other: { label: "Altro", color: "#6b7280", bg: "#e5e7eb" },
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function renderContactEmailHtml(data: ContactInput): string {
  const meta = TYPE_META[data.type]
  const name = escapeHtml(data.name)
  const email = escapeHtml(data.email)
  const subject = escapeHtml(data.subject)
  const message = escapeHtml(data.message).replace(/\n/g, "<br />")

  return `<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nuovo messaggio - ${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f4f1;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f6f4f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(209,65,36,0.08);">
            <tr>
              <td style="padding:32px 40px 16px 40px;border-bottom:1px solid #f0ece8;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align:middle;">
                      <span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#d14124;">TriviaMore</span>
                      <span style="margin-left:8px;font-size:13px;color:#8a8a8a;">contact form</span>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;padding:6px 12px;background-color:${meta.bg};color:${meta.color};font-size:12px;font-weight:600;border-radius:999px;text-transform:uppercase;letter-spacing:0.05em;">${meta.label}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;">
                <h1 style="margin:0 0 24px 0;font-size:22px;font-weight:700;line-height:1.3;color:#1a1a1a;letter-spacing:-0.02em;">${subject}</h1>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#8a8a8a;width:80px;">Da</td>
                    <td style="padding:8px 0;font-size:14px;color:#1a1a1a;font-weight:500;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#8a8a8a;border-top:1px solid #f0ece8;">Email</td>
                    <td style="padding:8px 0;font-size:14px;color:#1a1a1a;border-top:1px solid #f0ece8;">
                      <a href="mailto:${email}" style="color:#d14124;text-decoration:none;">${email}</a>
                    </td>
                  </tr>
                </table>
                <div style="padding:20px;background-color:#faf8f5;border-left:3px solid ${meta.color};border-radius:8px;font-size:14px;line-height:1.6;color:#2a2a2a;white-space:pre-wrap;">${message}</div>
                <p style="margin:24px 0 0 0;font-size:13px;color:#8a8a8a;line-height:1.6;">
                  Per rispondere, usa il pulsante "Rispondi" del tuo client di posta: il campo Reply-To e' impostato sull'indirizzo del mittente.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;background-color:#faf8f5;text-align:center;font-size:12px;color:#8a8a8a;">
                <p style="margin:0;">Messaggio inviato dal modulo contatti di TriviaMore</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function renderContactEmailText(data: ContactInput): string {
  const meta = TYPE_META[data.type]
  return [
    `Nuovo messaggio dal modulo contatti TriviaMore`,
    ``,
    `Tipo: ${meta.label}`,
    `Da: ${data.name}`,
    `Email: ${data.email}`,
    `Oggetto: ${data.subject}`,
    ``,
    `---`,
    ``,
    data.message,
    ``,
    `---`,
    `Per rispondere usa "Rispondi": il Reply-To punta all'indirizzo del mittente.`,
  ].join("\n")
}
