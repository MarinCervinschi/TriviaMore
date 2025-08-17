import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import UserProgressComponent from "@/components/pages/User/Progress";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

export default async function UserProgressPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const userProgress = await UserService.getUserProgressData(session.user.id);

	return (
		<AppLayout user={session.user}>
			<UserProgressComponent progressData={userProgress} currentUser={session.user} />
		</AppLayout>
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
