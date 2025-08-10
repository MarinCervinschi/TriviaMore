
import { AppLayout } from "@/components/layouts/AppLayout";
import BrowsePageComponent from "@/components/pages/Browse";
import { auth } from "@/lib/auth";
import { BrowseService } from "@/lib/services/browse.service";
import { BrowseTreeResponse } from "@/lib/types/browse.types";

export default async function BrowsePage() {
	const session = await auth();
	const data: BrowseTreeResponse = await BrowseService.getInitialTree();

	return (
		<AppLayout user={session?.user}>
			<BrowsePageComponent departments={data.departments} />
		</AppLayout>
	);
}
