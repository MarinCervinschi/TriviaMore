"use client";

import Head from "next/head";
import { notFound } from "next/navigation";

import UserProgressComponent from "@/components/pages/User/Progress";
import { useUserProgress } from "@/hooks/useUserData";
import { UserService } from "@/lib/services";
import { useUser } from "@/providers/user-provider";

import UserProgressLoadingPage from "./loading";

export default function UserProgressPage() {
	const user = useUser();
	const { data: userProgress, isLoading, isError } = useUserProgress(user.id);

	if (!user.id || isLoading) {
		return <UserProgressLoadingPage />;
	}
	if (!userProgress || isError) {
		notFound();
	}
	const displayName = UserService.getDisplayName(user);

	return (
		<>
			<Head>
				<title>{`Progressi di ${displayName} | TriviaMore`}</title>
				<meta
					name="description"
					content={`Visualizza i progressi dettagliati di ${displayName} in tutti i corsi e le materie su TriviaMore.`}
				/>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<UserProgressComponent progressData={userProgress} />
		</>
	);
}
