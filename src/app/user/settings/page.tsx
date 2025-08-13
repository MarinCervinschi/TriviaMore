import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import UserSettingsComponent from "@/components/pages/User/Settings";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";

export default async function UserSettingsPage() {
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
			<UserSettingsComponent userProfile={userProfile} currentUser={session.user} />
		</AppLayout>
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
