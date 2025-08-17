import { redirect } from "next/navigation";

import UserSettingsComponent from "@/components/pages/User/Settings";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

export default async function UserSettingsPage() {
	const session = await auth();

	const userProfile = await UserService.getUserProfile(session?.user.id);

	if (!userProfile) {
		redirect("/auth/login");
	}

	return (
		<UserSettingsComponent userProfile={userProfile} currentUser={session?.user} />
	);
}

export async function generateMetadata() {
	const session = await auth();

	if (!session?.user) {
		return {
			title: "Accesso Richiesto - TriviaMore",
			description: "Effettua l'accesso per modificare le tue impostazioni.",
			robots: "noindex, nofollow",
		};
	}

	const displayName = UserService.getDisplayName(session.user);

	return {
		title: `Impostazioni di ${displayName} | TriviaMore`,
		description: `Modifica le impostazioni e le preferenze del profilo di ${displayName} su TriviaMore.`,
		keywords: `impostazioni, profilo, ${displayName}, TriviaMore, preferenze`,
	};
}
