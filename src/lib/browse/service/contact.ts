import type { z } from "zod";

import type { contactSchema } from "../contact-schema";

type ContactInput = z.infer<typeof contactSchema>;

export async function submitContact(
	input: ContactInput
): Promise<{ success: boolean; error?: string }> {
	// Honeypot: bots tend to fill the hidden `website` field. Drop silently so
	// they don't learn anything about why their submission was rejected.
	if (input.website && input.website.trim().length > 0) {
		return { success: true };
	}

	const recipient = process.env.CONTACT_RECIPIENT;
	if (!recipient) {
		console.error("CONTACT_RECIPIENT env var not configured");
		return { success: false, error: "Servizio non configurato" };
	}

	const { renderContactEmailHtml, renderContactEmailText } =
		await import("@/lib/email/templates/contact");
	const { sendMail } = await import("@/lib/email/server");

	try {
		await sendMail({
			to: recipient,
			subject: `[Contatti] ${input.subject}`,
			html: renderContactEmailHtml(input),
			text: renderContactEmailText(input),
			replyTo: `${input.name} <${input.email}>`,
		});
		return { success: true };
	} catch (err) {
		console.error("Failed to send contact email:", err);
		return {
			success: false,
			error: "Errore durante l'invio. Riprova piu' tardi.",
		};
	}
}
