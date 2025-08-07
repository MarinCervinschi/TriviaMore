import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AppLayout } from "@/components/layouts/AppLayout";
import BrowsePageComponent from "@/components/pages/Browse";
import { BrowseService } from "@/lib/services/browse.service";
import { getQueryClient } from "@/providers/get-query-client";

async function fetchDepartments() {
	try {
		return await BrowseService.getInitialTree();
	} catch (error) {
		throw error;
	}
}

export default async function BrowsePage() {
	const queryClient = getQueryClient();

	try {
		await queryClient.prefetchQuery({
			queryKey: ["browse-departments"],
			queryFn: fetchDepartments,
		});
	} catch (error) {
		console.error("Failed to prefetch departments:", error);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AppLayout>
				<BrowsePageComponent />
			</AppLayout>
		</HydrationBoundary>
	);
}
