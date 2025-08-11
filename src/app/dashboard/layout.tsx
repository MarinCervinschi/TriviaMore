import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session) {
		redirect("/auth/login");
	}

	return <AppLayout user={session.user}>{children}</AppLayout>;
}
