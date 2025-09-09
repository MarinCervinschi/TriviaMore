/**
 * Genera le iniziali del nome utente per l'avatar
 * @param name - Nome completo dell'utente
 * @returns Iniziali maiuscole (max 2 caratteri)
 */
export function getUserInitials(name?: string | null): string {
	if (!name) {return "U";}
	return name
		.split(" ")
		.map(n => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

/**
 * Gestisce il logout dell'utente
 * @param onComplete - Callback da eseguire dopo il logout
 */
export async function handleUserSignOut(onComplete?: () => void): Promise<void> {
	const { signOut } = await import("next-auth/react");

	try {
		await signOut({
			redirect: true,
			callbackUrl: "/auth/login",
		});
		onComplete?.();
	} catch (error) {
		console.error("Error during sign out:", error);
	}
}
