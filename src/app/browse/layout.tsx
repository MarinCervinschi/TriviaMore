import { AppLayout } from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";
import { EditModeProvider } from "@/providers/edit-mode-provider";

export default async function BrowseLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	return (
		<AppLayout user={session?.user}>
			<EditModeProvider>{children}</EditModeProvider>
		</AppLayout>
	);
}
