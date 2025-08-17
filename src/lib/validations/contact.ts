import { z } from "zod";

// Schema per il form di contatto
export const contactSchema = z.object({
	name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
	email: z.email("Email non valida"),
	subject: z
		.string()
		.min(5, "L'oggetto deve essere di almeno 5 caratteri")
		.max(100, "L'oggetto non può superare i 100 caratteri"),
	message: z
		.string()
		.min(10, "Il messaggio deve essere di almeno 10 caratteri")
		.max(1000, "Il messaggio non può superare i 1000 caratteri"),
	type: z.enum(["general", "support", "collaboration", "bug"], {
		error: "Seleziona un tipo di richiesta valido",
	}),
});

export type ContactInput = z.infer<typeof contactSchema>;

// Opzioni per il tipo di richiesta
export const contactTypeOptions = [
	{ value: "general", label: "Informazioni Generali" },
	{ value: "support", label: "Supporto Tecnico" },
	{ value: "collaboration", label: "Collaborazione" },
	{ value: "bug", label: "Segnalazione Bug" },
] as const;
