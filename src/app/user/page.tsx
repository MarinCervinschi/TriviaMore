import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import UserDashboardComponent from "@/components/pages/User/Dashboard";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

export default async function UserPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	// Get user profile data
	const userProfile = await UserService.getUserProfile(session.user.id);

	if (!userProfile) {
		redirect("/auth/login");
	}

	return (
		<AppLayout user={session.user}>
			<UserDashboardComponent userProfile={userProfile} currentUser={session.user} />
		</AppLayout>
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
