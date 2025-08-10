import { LandingPageContent } from "@/components/LandingPage";
import { AppLayout } from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
	const session = await auth();
	return (
		<AppLayout user={session?.user} showFooter={false}>
			<LandingPageContent />
		</AppLayout>
	);
}
