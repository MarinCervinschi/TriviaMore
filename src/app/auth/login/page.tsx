import React from "react";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DemoCredentials } from "@/components/auth/DemoCredentials";
import LoginPageContent from "@/components/pages/Auth/LoginPageContent";

const demoCredentials = [
	{
		role: "Superadmin",
		email: "superadmin@example.com",
		password: "password123",
	},
	{
		role: "Student",
		email: "mario.rossi@example.com",
		password: "password123",
	},
];

const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV || "development";

export default function LoginPage() {
	return (
		<AuthLayout>
			<AuthHeader title="Accedi" subtitle="Accedi al tuo account" />
			<LoginPageContent />
			{NODE_ENV === "development" && <DemoCredentials credentials={demoCredentials} />}
		</AuthLayout>
	);
}

export async function generateMetadata() {
	return {
		title: "Accedi | Trivia More",
		description: "Accedi al tuo account su Trivia More.",
	};
}
