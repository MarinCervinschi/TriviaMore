import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CareerRecord } from "@/components/career/career-record";
import { crmQueries } from "@/lib/crm/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/user/career/exams")({
	head: () => seoHead({ title: "Carriera — libretto", noindex: true }),
	component: CareerExamsPage,
});

function CareerExamsPage() {
	const { data: career } = useSuspenseQuery(crmQueries.career());
	return <CareerRecord career={career} />;
}
