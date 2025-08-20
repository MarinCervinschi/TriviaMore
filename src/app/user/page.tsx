"use client";

import Head from "next/head";
import { notFound } from "next/navigation";

import UserDashboardComponent from "@/components/pages/User/Dashboard";
import { useUserData } from "@/hooks/useUserData";
import { UserService } from "@/lib/services";
import { useUser } from "@/providers/user-provider";

import UserDashboardLoadingPage from "./loading";

export default function UserPage() {
	const user = useUser();
	const { data: userProfile, isLoading, isError } = useUserData(user.id);

	if (!user.id || isLoading) {
		return <UserDashboardLoadingPage />;
	}

	if (!userProfile || isError) {
		notFound();
	}

	const displayName = UserService.getDisplayName(userProfile);

	return (
		<>
			<Head>
				<title>{`Il Mio Profilo - ${displayName} | TriviaMore`}</title>
				<meta
					name="description"
					content={`Dashboard personale di ${displayName} su TriviaMore`}
				/>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<UserDashboardComponent userProfile={userProfile} />;
		</>
	);
}
