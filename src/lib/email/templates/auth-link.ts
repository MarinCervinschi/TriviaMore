export type AuthLinkPurpose = "verify-email" | "reset-password";

const COPY: Record<
	AuthLinkPurpose,
	{ subject: string; label: string; intro: string; button: string; outro: string }
> = {
	"verify-email": {
		subject: "Conferma la tua email su TriviaMore",
		label: "conferma email",
		intro: "Apri il link per confermare il tuo indirizzo email e attivare l'account.",
		button: "Conferma email",
		outro: "Se non hai creato un account su TriviaMore, ignora questa email.",
	},
	"reset-password": {
		subject: "Reimposta la password di TriviaMore",
		label: "nuova password",
		intro: "Apri il link per scegliere una nuova password.",
		button: "Scegli una nuova password",
		outro:
			"Se non hai chiesto di cambiare la password, ignora questa email. La password attuale resta valida.",
	},
};

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/** The email carrying a one-time link; `expiresInMinutes` is shown to the reader. */
export function renderAuthLinkEmail({
	purpose,
	url,
	expiresInMinutes,
}: {
	purpose: AuthLinkPurpose;
	url: string;
	expiresInMinutes: number;
}): { subject: string; html: string; text: string } {
	const copy = COPY[purpose];
	const expiry = `Il link scade tra ${expiresInMinutes} minuti.`;
	const href = escapeHtml(url);

	const html = `<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${copy.subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f4f1;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f6f4f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(209,65,36,0.08);">
            <tr>
              <td style="padding:32px 40px 16px 40px;border-bottom:1px solid #f0ece8;">
                <span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#d14124;">TriviaMore</span>
                <span style="margin-left:8px;font-size:13px;color:#8a8a8a;">${copy.label}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;font-size:14px;line-height:1.7;color:#2a2a2a;">
                <p style="margin:0 0 24px 0;">${copy.intro}</p>
                <p style="margin:0 0 24px 0;text-align:center;">
                  <a href="${href}" style="display:inline-block;padding:12px 24px;background-color:#d14124;color:#ffffff;font-weight:600;text-decoration:none;border-radius:12px;">${copy.button}</a>
                </p>
                <p style="margin:0 0 8px 0;">${expiry}</p>
                <p style="margin:0 0 24px 0;color:#8a8a8a;">${copy.outro}</p>
                <p style="margin:0;font-size:12px;color:#8a8a8a;word-break:break-all;">Se il pulsante non funziona, copia questo indirizzo nel browser: ${href}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

	const text = [copy.intro, "", url, "", expiry, copy.outro].join("\n");

	return { subject: copy.subject, html, text };
}
