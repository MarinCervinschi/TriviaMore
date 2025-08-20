"use client";

import Head from "next/head";
import { notFound } from "next/navigation";

import UserBookmarksComponent from "@/components/pages/User/Bookmarks";
import { useUserBookmarks } from "@/hooks/useBookmarks";
import { UserService } from "@/lib/services";
import { useUser } from "@/providers/user-provider";

import UserBookmarksLoadingPage from "./loading";

export default function UserBookmarksPage() {
	const user = useUser();
	const { data: userBookmarks, isLoading, isError } = useUserBookmarks(user.id);

	if (!user.id || isLoading) {
		return <UserBookmarksLoadingPage />;
	}

	if (!userBookmarks || isError) {
		notFound();
	}
	const displayName = UserService.getDisplayName(user);

	return (
		<>
			<Head>
				<title>Segnalibri di {displayName} | TriviaMore</title>
				<meta
					name="description"
					content={`Visualizza e gestisci i segnalibri salvati da ${displayName} su TriviaMore.`}
				/>
				<meta
					name="keywords"
					content={`segnalibri, domande salvate, ${displayName}, TriviaMore, quiz, studio`}
				/>
			</Head>
			<UserBookmarksComponent bookmarks={userBookmarks} />
		</>
	);
}
