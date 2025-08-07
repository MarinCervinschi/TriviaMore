import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { type LoginInput, loginSchema } from "@/lib/validations/auth";

export const useLoginForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
	});

	const handleAuthError = (error: string) => {
		let errorMessage = "Credenziali non valide.";

		switch (error) {
			case "CredentialsSignin":
				errorMessage = "Email o password non corretti.";
				break;
			case "User not found":
				errorMessage = "Nessun utente trovato con questa email.";
				break;
			case "Invalid password":
				errorMessage = "Password non corretta.";
				break;
			case "Configuration":
				errorMessage = "Errore di configurazione del server. Riprova.";
				break;
			default:
				errorMessage = `Errore durante l'accesso: ${error}`;
		}

		setError("root", { message: errorMessage });
		toast.error(errorMessage);
	};

	const onSubmit: SubmitHandler<LoginInput> = async data => {
		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				handleAuthError(result.error);
			} else if (result?.ok) {
				toast.success("Accesso effettuato con successo!");
				router.push("/dashboard");
			} else {
				setError("root", {
					message: "Si è verificato un errore imprevisto durante l'accesso.",
				});
				toast.error("Si è verificato un errore imprevisto durante l'accesso.");
			}
		} catch (error) {
			console.error("Login error:", error);
			setError("root", {
				message: "Si è verificato un errore di connessione.",
			});
			toast.error("Si è verificato un errore di connessione.");
		} finally {
			setIsLoading(false);
		}
	};

	return {
		register,
		handleSubmit,
		onSubmit,
		errors,
		isSubmitting: isSubmitting || isLoading,
	};
};
