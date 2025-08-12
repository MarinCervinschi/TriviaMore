import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import UserActivityComponent from "@/components/pages/User/Activity";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";

export default async function UserActivityPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const userActivity = await UserService.getUserRecentActivity(session.user.id);

	return (
		<AppLayout user={session.user}>
			<UserActivityComponent recentActivity={userActivity} currentUser={session.user} />
		</AppLayout>
	);
}

export async function generateMetadata() {
	const session = await auth();

	if (!session?.user) {
		return {
			title: "Accesso Richiesto - TriviaMore",
			description: "Effettua l'accesso per visualizzare le tue attività.",
			robots: "noindex, nofollow",
		};
	}

	const displayName = UserService.getDisplayName(session.user);

	return {
		title: `Attività di ${displayName} | TriviaMore`,
		description: `Visualizza tutte le attività recenti di ${displayName} su TriviaMore.`,
		keywords: `attività, quiz, ${displayName}, TriviaMore, cronologia`,
	};
}
