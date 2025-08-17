import { redirect } from "next/navigation";

import UserProgressComponent from "@/components/pages/User/Progress";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

export default async function UserProgressPage() {
	const session = await auth();

	const userProgress = await UserService.getUserProgressData(session?.user.id);
	if (!userProgress) {
		redirect("/auth/login");
	}

	return (
		<UserProgressComponent progressData={userProgress} currentUser={session?.user} />
	);
}

export async function generateMetadata() {
	const session = await auth();

	if (!session?.user) {
		return {
			title: "Accesso Richiesto - TriviaMore",
			description: "Effettua l'accesso per visualizzare i tuoi progressi.",
			robots: "noindex, nofollow",
		};
	}

	const displayName = UserService.getDisplayName(session.user);

	return {
		title: `Progressi di ${displayName} | TriviaMore`,
		description: `Visualizza i progressi dettagliati di ${displayName} in tutti i corsi e le materie su TriviaMore.`,
		keywords: `progressi, statistiche, ${displayName}, TriviaMore, quiz, apprendimento`,
	};
}
