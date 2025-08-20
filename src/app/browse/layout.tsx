import { AppLayout } from "@/components/layouts/AppLayout";
import { EditModeProvider } from "@/providers/edit-mode-provider";

export default async function BrowseLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AppLayout>
			<EditModeProvider>{children}</EditModeProvider>
		</AppLayout>
	);
}
