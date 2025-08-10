import BrowsePageComponent from "@/components/pages/Browse";
import { BrowseService } from "@/lib/services/browse.service";
import { BrowseTreeResponse } from "@/lib/types/browse.types";

export default async function BrowsePage() {
	const data: BrowseTreeResponse = await BrowseService.getInitialTree();

	return <BrowsePageComponent departments={data.departments} />;
}
