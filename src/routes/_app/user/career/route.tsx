import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { CareerShell } from "@/components/career/career-view";
import { CAREER_TABS } from "@/components/layout/nav-items";
import { CareerSkeleton } from "@/components/skeletons";
import { requireEnrollmentFn } from "@/lib/crm/api";
import { crmQueries } from "@/lib/crm/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/user/career")({
	beforeLoad: () => requireEnrollmentFn(),
	loader: ({ context }) => context.queryClient.ensureQueryData(crmQueries.career()),
	head: () => seoHead({ title: "Carriera", noindex: true }),
	pendingComponent: CareerSkeleton,
	component: CareerLayout,
});

function CareerLayout() {
	const { data: career } = useSuspenseQuery(crmQueries.career());
	const { data: curriculumOptions = [] } = useQuery({
		...crmQueries.curriculumOptions(career.course.id, career.cohort ?? 0),
		enabled: career.planGap === "no-curriculum" && career.cohort !== null,
	});

	return (
		<div className="container py-6 pb-10">
			<CareerShell
				career={career}
				tabs={CAREER_TABS}
				curriculumOptions={curriculumOptions}
			>
				<Outlet />
			</CareerShell>
		</div>
	);
}
