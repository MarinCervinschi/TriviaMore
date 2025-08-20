import { LandingPageContent } from "@/components/LandingPage";
import { AppLayout } from "@/components/layouts/AppLayout";

export default function LandingPage() {
	return (
		<AppLayout showFooter={false}>
			<LandingPageContent />
		</AppLayout>
	);
}
