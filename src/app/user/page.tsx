import { redirect } from "next/navigation";

import UserDashboardComponent from "@/components/pages/User/Dashboard";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

export default async function UserPage() {
	const session = await auth();

	const userProfile = await UserService.getUserProfile(session?.user.id);

	if (!userProfile) {
		redirect("/auth/login");
	}

	return (
		<UserDashboardComponent userProfile={userProfile} currentUser={session?.user} />
	);
}

export async function generateMetadata() {
	const session = await auth();

	if (!session?.user) {
		return {
			title: "Accesso Richiesto - TriviaMore",
			description: "Effettua l'accesso per visualizzare il tuo profilo.",
			robots: "noindex, nofollow",
		};
	}

	const displayName = UserService.getDisplayName(session.user);

	return {
		title: `Il Mio Profilo - ${displayName} | TriviaMore`,
		description: `Dashboard personale di ${displayName} su TriviaMore. Visualizza le tue statistiche, progressi e attività recenti.`,
		keywords: `profilo utente, dashboard, ${displayName}, TriviaMore, quiz, progressi, statistiche`,
	};
}
