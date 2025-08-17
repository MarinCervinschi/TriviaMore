import { NextResponse } from "next/server";

import { Resend } from "resend";

const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV === "production";

const fromMail = NODE_ENV ? process.env.FROM_EMAIL! : "Acme <onboarding@resend.dev>";
const toMail = process.env.TO_EMAIL!;
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
	try {
		const data = await req.json();

		const { name, email, subject, message, type } = data;

		await resend.emails.send({
			from: fromMail,
			to: toMail,
			subject: `[${type}] ${subject}`,
			text: `
        Nome: ${name}
        Email: ${email}
        Tipo: ${type}

        Messaggio:
        ${message}
      `,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Errore nell'invio della mail" },
			{ status: 500 }
		);
	}
}
