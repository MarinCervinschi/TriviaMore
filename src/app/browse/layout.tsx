import { AppLayout } from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";

export default async function BrowseLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	return <AppLayout user={session?.user}>{children}</AppLayout>;
}
