import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import UserBookmarksComponent from "@/components/pages/User/Bookmarks";
import { auth } from "@/lib/auth";
import { BookmarkService } from "@/lib/services";
import { UserService } from "@/lib/services";

export default async function UserBookmarksPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const userBookmarks = await BookmarkService.getUserBookmarks(session.user.id);

	return (
		<AppLayout user={session.user}>
			<UserBookmarksComponent bookmarks={userBookmarks} currentUser={session.user} />
		</AppLayout>
	);
}

export async function generateMetadata() {
	const session = await auth();

	if (!session?.user) {
		return {
			title: "Accesso Richiesto - TriviaMore",
			description: "Effettua l'accesso per visualizzare i tuoi segnalibri.",
			robots: "noindex, nofollow",
		};
	}

	const displayName = UserService.getDisplayName(session.user);

	return {
		title: `Segnalibri di ${displayName} | TriviaMore`,
		description: `Visualizza e gestisci i segnalibri salvati da ${displayName} su TriviaMore.`,
		keywords: `segnalibri, domande salvate, ${displayName}, TriviaMore, quiz, studio`,
	};
}
