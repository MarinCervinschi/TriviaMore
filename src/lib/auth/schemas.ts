import { z } from "zod";

const passwordSchema = z
	.string()
	.min(6, "La password deve essere di almeno 6 caratteri")
	.max(100, "La password non può superare i 100 caratteri")
	.regex(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
		"La password deve contenere almeno una lettera minuscola, una maiuscola e un numero"
	)
	.refine(password => !/\s/.test(password), "La password non può contenere spazi");

const emailSchema = z
	.email("Email non valida")
	.max(100, "L'email non può superare i 100 caratteri")
	.trim()
	.toLowerCase();

const userBaseSchema = z.object({
	name: z
		.string()
		.min(2, "Il nome deve essere di almeno 2 caratteri")
		.max(50, "Il nome non può superare i 50 caratteri")
		.regex(
			/^[\p{L}\p{M}][\p{L}\p{M}\s'.,-]*[\p{L}\p{M}.]$/u,
			"Il nome deve iniziare e finire con una lettera e può contenere spazi, apostrofi e trattini"
		)
		.refine(
			name => !/\s{2,}/.test(name),
			"Il nome non può contenere spazi consecutivi"
		),
	email: emailSchema,
});

export const registerSchema = userBaseSchema
	.extend({
		password: passwordSchema,
		password_confirm: z.string().min(1, "Conferma la password"),
		terms_accepted: z.boolean().refine(v => v === true, {
			message: "Devi accettare i Termini e Condizioni per registrarti",
		}),
		privacy_accepted: z.boolean().refine(v => v === true, {
			message: "Devi accettare l'Informativa sulla Privacy per registrarti",
		}),
	})
	.refine(data => data.password === data.password_confirm, {
		message: "Le password non coincidono",
		path: ["password_confirm"],
	});

export const loginSchema = z.object({
	email: emailSchema,
	password: z
		.string()
		.min(1, "Password richiesta")
		.max(100, "La password non può superare i 100 caratteri"),
});

export const oauthProviderSchema = z.object({
	provider: z.enum(["github", "google"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1),
		password: passwordSchema,
		password_confirm: z.string().min(1, "Conferma la password"),
	})
	.refine(data => data.password === data.password_confirm, {
		message: "Le password non coincidono",
		path: ["password_confirm"],
	});

export type OAuthProvider = z.infer<typeof oauthProviderSchema>["provider"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
