import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AppLayout } from "@/components/layouts/AppLayout";
import { getQueryClient } from "@/providers/get-query-client";
import BrowsePageComponent from "@/components/pages/Browse";

async function fetchDepartments() {
	try {
		const baseUrl = process.env.VERCEL_URL 
			? `https://${process.env.VERCEL_URL}`
			: 'http://localhost:3000';
		
		const response = await fetch(`${baseUrl}/api/browse`);
		if (!response.ok) {
			throw new Error("Failed to fetch departments");
		}
		return response.json();
	} catch (error) {
		console.error("Error fetching departments:", error);
		throw error;
	}
}

export default async function BrowsePage() {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["browse-departments"],
		queryFn: fetchDepartments,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AppLayout>
				<BrowsePageComponent />
			</AppLayout>
		</HydrationBoundary>
	);
}
