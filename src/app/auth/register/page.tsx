import React from "react";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import RegisterPageContent from "@/components/pages/Auth/RegisterPageContent";

export default function RegisterPage() {
	return (
		<AuthLayout>
			<AuthHeader title="Register" subtitle="Create your account" />

			<RegisterPageContent />
		</AuthLayout>
	);
}

export async function generateMetadata() {
	return {
		title: "Registrati | Trivia More",
		description: "Crea il tuo account su Trivia More.",
	};
}
