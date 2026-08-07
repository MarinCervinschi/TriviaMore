type MaintainerInviteDefaultsInput = {
	courseName: string;
	inviteeName?: string | null;
};

// Builds the default, editable subject + body for a maintainer invitation.
// Kept client-safe (pure string logic) so the admin dialog can prefill it.
export function buildMaintainerInviteDefaults({
	courseName,
	inviteeName,
}: MaintainerInviteDefaultsInput): { subject: string; body: string } {
	const greeting = inviteeName?.trim() ? `Ciao ${inviteeName.trim()},` : "Ciao,";
	const subject = `Invito a diventare maintainer del corso ${courseName}`;

	const body = [
		greeting,
		"",
		`ti scriviamo da TriviaMore perché vorremmo proporti di diventare maintainer del corso «${courseName}».`,
		"",
		"Cosa potrai fare come maintainer:",
		"• Creare e modificare le sezioni e le domande del corso",
		"• Revisionare e approvare le proposte di contenuto degli studenti",
		"• Mantenere aggiornato il materiale didattico del corso",
		"",
		"Quali sono i vincoli:",
		`• Il tuo accesso è limitato al corso «${courseName}»: non potrai gestire altri corsi o dipartimenti`,
		"• Sei responsabile della qualità e della correttezza dei contenuti che pubblichi",
		"• Il ruolo può essere revocato in qualsiasi momento dallo staff",
		"",
		"Se sei interessato/a, rispondi a questa email e procederemo con l'attivazione.",
		"",
		"Grazie,",
		"Lo staff di TriviaMore",
	].join("\n");

	return { subject, body };
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

// Wraps the (possibly edited) plain-text body into the branded TriviaMore shell.
// Only the body is user-editable; the header and footer stay fixed.
export function renderMaintainerInviteHtml({
	body,
	courseName,
	logoUrl,
}: {
	body: string;
	courseName: string;
	logoUrl: string;
}): string {
	const safeBody = escapeHtml(body).replace(/\n/g, "<br />");
	const safeCourse = escapeHtml(courseName);

	return `<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invito maintainer - ${safeCourse}</title>
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
                      <img src="${logoUrl}" width="28" height="28" alt="TriviaMore" style="display:inline-block;vertical-align:middle;border:0;" />
                      <span style="margin-left:8px;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#d14124;vertical-align:middle;">TriviaMore</span>
                      <span style="margin-left:8px;font-size:13px;color:#8a8a8a;vertical-align:middle;">invito maintainer</span>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;padding:6px 12px;background-color:#fef3c7;color:#d97706;font-size:12px;font-weight:600;border-radius:999px;text-transform:uppercase;letter-spacing:0.05em;">${safeCourse}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;font-size:14px;line-height:1.7;color:#2a2a2a;">
                ${safeBody}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;background-color:#faf8f5;text-align:center;font-size:12px;color:#8a8a8a;">
                <p style="margin:0;">Hai ricevuto questa email da TriviaMore. Per rispondere usa il pulsante "Rispondi" del tuo client di posta.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
