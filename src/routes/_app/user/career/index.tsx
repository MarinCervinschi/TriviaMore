import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { CareerOverview } from "@/components/career/career-overview";
import { crmQueries } from "@/lib/crm/queries";

export const Route = createFileRoute("/_app/user/career/")({
	component: CareerOverviewPage,
});

const PATHS = {
	overview: "/user/career",
	record: "/user/career/exams",
	forecast: "/user/career/forecast",
} as const;

function CareerOverviewPage() {
	const navigate = useNavigate();
	const { data: career } = useSuspenseQuery(crmQueries.career());
	return (
		<CareerOverview career={career} onNavigate={tab => navigate({ to: PATHS[tab] })} />
	);
}
