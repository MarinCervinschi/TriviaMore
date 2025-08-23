"use client";

import Head from "next/head";
import { notFound } from "next/navigation";

import UserClassesComponent from "@/components/pages/User/Classes";
import { useUserClasses } from "@/hooks/useUserData";
import { UserService } from "@/lib/services";
import { useUser } from "@/providers/user-provider";

import UserClassesLoadingPage from "./loading";

export default function UserClassesPage() {
	const user = useUser();
	const { data: userClasses, isLoading, isError } = useUserClasses(user.id);

	if (!user.id || isLoading) {
		return <UserClassesLoadingPage />;
	}

	if (!userClasses || isError) {
		notFound();
	}

	const displayName = UserService.getDisplayName(user);

	return (
		<>
			<Head>
				<title>{`Corsi di ${displayName} | TriviaMore`}</title>
				<meta
					name="description"
					content={`Visualizza e gestisci i corsi seguiti da ${displayName} su TriviaMore.`}
				/>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<UserClassesComponent userClasses={userClasses} />
		</>
	);
}
