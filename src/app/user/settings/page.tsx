"use client";

import Head from "next/head";
import { notFound } from "next/navigation";

import UserSettingsComponent from "@/components/pages/User/Settings";
import { useUserData } from "@/hooks/useUserData";
import { UserService } from "@/lib/services";
import { useUser } from "@/providers/user-provider";

import UserSettingsLoadingPage from "./loading";

export default function UserSettingsPage() {
	const user = useUser();
	const { data: userProfile, isLoading, isError } = useUserData(user.id);

	if (!user.id || isLoading) {
		return <UserSettingsLoadingPage />;
	}
	if (!userProfile || isError) {
		notFound();
	}
	const displayName = UserService.getDisplayName(userProfile);

	return (
		<>
			<Head>
				<title>{`Impostazioni di ${displayName} | TriviaMore`}</title>
				<meta
					name="description"
					content={`Modifica le impostazioni e le preferenze del profilo di ${displayName} su TriviaMore.`}
				/>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<UserSettingsComponent userProfile={userProfile} />
		</>
	);
}
