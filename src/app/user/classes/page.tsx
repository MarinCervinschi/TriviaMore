import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import UserClassesComponent from "@/components/pages/User/Classes";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";

export default async function UserClassesPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const userClasses = await UserService.getUserSavedClasses(session.user.id);

	return (
		<AppLayout user={session.user}>
			<UserClassesComponent userClasses={userClasses} currentUser={session.user} />
		</AppLayout>
	);
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
