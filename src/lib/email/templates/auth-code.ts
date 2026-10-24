export type AuthCodePurpose = "email-verification" | "forget-password";

const COPY: Record<
	AuthCodePurpose,
	{ subject: string; label: string; intro: string; outro: string }
> = {
	"email-verification": {
		subject: "Il tuo codice di verifica TriviaMore",
		label: "verifica email",
		intro: "Inserisci questo codice per confermare il tuo indirizzo email:",
		outro: "Se non hai creato un account su TriviaMore, ignora questa email.",
	},
	"forget-password": {
		subject: "Il codice per reimpostare la password di TriviaMore",
		label: "nuova password",
		intro: "Inserisci questo codice per scegliere una nuova password:",
		outro:
			"Se non hai chiesto di cambiare la password, ignora questa email. La password attuale resta valida.",
	},
};

/** The email carrying a one-time code; `expiresInMinutes` is shown to the reader. */
export function renderAuthCodeEmail({
	purpose,
	code,
	expiresInMinutes,
}: {
	purpose: AuthCodePurpose;
	code: string;
	expiresInMinutes: number;
}): { subject: string; html: string; text: string } {
	const copy = COPY[purpose];
	const expiry = `Il codice scade tra ${expiresInMinutes} minuti.`;

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
                <p style="margin:0 0 20px 0;">${copy.intro}</p>
                <p style="margin:0 0 20px 0;padding:16px;background-color:#faf8f5;border-radius:12px;text-align:center;font-size:32px;font-weight:700;letter-spacing:0.3em;color:#1a1a1a;">${code}</p>
                <p style="margin:0 0 8px 0;">${expiry}</p>
                <p style="margin:0;color:#8a8a8a;">${copy.outro}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

	const text = [copy.intro, "", code, "", expiry, copy.outro].join("\n");

	return { subject: copy.subject, html, text };
}
