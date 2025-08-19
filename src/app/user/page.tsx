"use client";

import Head from "next/head";
import { notFound } from "next/navigation";

import { useSession } from "next-auth/react";

import UserDashboardComponent from "@/components/pages/User/Dashboard";
import { useUserData } from "@/hooks/useUserData";
import { UserService } from "@/lib/services";

export default function UserPage() {
	const { data: session } = useSession();
	const { data: userProfile, isError } = useUserData(session?.user.id);
	const displayName = UserService.getDisplayName(userProfile);

	if (!userProfile || isError) {
		notFound();
	}
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
