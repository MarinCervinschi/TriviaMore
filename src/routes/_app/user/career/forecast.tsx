import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CareerForecast } from "@/components/career/career-forecast";
import { crmQueries } from "@/lib/crm/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/user/career/forecast")({
	head: () => seoHead({ title: "Carriera — previsione", noindex: true }),
	component: CareerForecastPage,
});

function CareerForecastPage() {
	const { data: career } = useSuspenseQuery(crmQueries.career());
	return <CareerForecast career={career} />;
}
