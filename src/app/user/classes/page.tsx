import { redirect } from "next/navigation";

import UserClassesComponent from "@/components/pages/User/Classes";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

export default async function UserClassesPage() {
	const session = await auth();

	const userClasses = await UserService.getUserSavedClasses(session?.user.id);
	if (!userClasses) {
		redirect("/auth/login");
	}

	return <UserClassesComponent userClasses={userClasses} currentUser={session?.user} />;
}

export async function generateMetadata() {
	const session = await auth();

	if (!session?.user) {
		return {
			title: "Accesso Richiesto - TriviaMore",
			description: "Effettua l'accesso per visualizzare i tuoi corsi.",
			robots: "noindex, nofollow",
		};
	}

	const displayName = UserService.getDisplayName(session.user);

	return {
		title: `Corsi di ${displayName} | TriviaMore`,
		description: `Visualizza e gestisci i corsi seguiti da ${displayName} su TriviaMore.`,
		keywords: `corsi, classi, ${displayName}, TriviaMore, università, studio`,
	};
}
