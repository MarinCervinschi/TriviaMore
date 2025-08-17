import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	return <AppLayout user={session.user}>{children}</AppLayout>;
}
