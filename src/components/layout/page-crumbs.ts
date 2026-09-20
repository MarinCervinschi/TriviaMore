import { BookIcon } from "@solar-icons/react/linear/book";
import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { CompassIcon } from "@solar-icons/react/linear/compass";
import { ConfettiIcon } from "@solar-icons/react/linear/confetti";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { HistoryIcon } from "@solar-icons/react/linear/history";
import { HomeIcon } from "@solar-icons/react/linear/home";
import { InboxIcon } from "@solar-icons/react/linear/inbox";
import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { MedalRibbonStarIcon } from "@solar-icons/react/linear/medal-ribbon-star";
import { SettingsIcon } from "@solar-icons/react/linear/settings";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import { isMatch, useMatches } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import type { Crumb } from "@/components/shared/app-breadcrumb";

/**
 * The trail is derived from the matched routes, not rendered by the page.
 *
 * A page cannot put its own crumbs into the shell's header without a context, and a
 * context only fills once the page has committed — which leaves the bar empty for a
 * frame on every navigation. `useMatches` resolves before paint, and on the server.
 */
type CrumbCtx = { loaderData: unknown; params: Record<string, string> };

type CrumbDef = {
	label: string | ((ctx: CrumbCtx) => string);
	icon?: Icon;
	/**
	 * Levels the URL implies but the route tree does not nest. `analytics/class/$id`
	 * is a sibling of `analytics/`, not its child, and the four browse levels are all
	 * siblings too — without this the trail would jump straight from the dashboard to
	 * the name of a section.
	 */
	parents?: Crumb[] | ((ctx: CrumbCtx) => Crumb[]);
};

/** Reads a nested string off loader data without trusting its shape. */
const dig = (value: unknown, path: string): string | undefined => {
	let current = value;
	for (const key of path.split(".")) {
		if (typeof current !== "object" || current === null) return undefined;
		current = (current as Record<string, unknown>)[key];
	}
	return typeof current === "string" && current.length > 0 ? current : undefined;
};

/**
 * The analytics detail loaders resolve a `Promise.all`, so their data is a tuple and
 * the entity's name only exists on the first entry of its attempt history — there is
 * no `name` anywhere to read.
 */
const fromFirstAttempt = (data: unknown, field: string, fallback: string) => {
	const first = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : undefined;
	const value =
		typeof first === "object" && first !== null
			? (first as Record<string, unknown>)[field]
			: undefined;
	return typeof value === "string" && value.length > 0 ? value : fallback;
};

const ANALYTICS: Crumb = {
	label: "Analytics",
	to: "/user/analytics",
	icon: GraphUpIcon,
};
const BROWSE: Crumb = { label: "Esplora", to: "/browse", icon: CompassIcon };

/** The catalogue's ancestors, addressed by route params so the links stay typed. */
const department = (ctx: CrumbCtx, path: string): Crumb => ({
	label: dig(ctx.loaderData, path) ?? "Dipartimento",
	to: "/browse/$department",
	params: { department: ctx.params.department! },
	icon: BuildingsIcon,
});

const course = (ctx: CrumbCtx, path: string): Crumb => ({
	label: dig(ctx.loaderData, path) ?? "Corso",
	to: "/browse/$department/$course",
	params: { department: ctx.params.department!, course: ctx.params.course! },
	icon: DiplomaIcon,
});

const classCrumb = (ctx: CrumbCtx, path: string): Crumb => ({
	label: dig(ctx.loaderData, path) ?? "Insegnamento",
	to: "/browse/$department/$course/$class",
	params: {
		department: ctx.params.department!,
		course: ctx.params.course!,
		class: ctx.params.class!,
	},
	icon: BookIcon,
});

const CRUMBS: Record<string, CrumbDef> = {
	"/_app/user/": { label: "Dashboard", icon: HomeIcon },
	"/_app/user/classes": { label: "I miei insegnamenti", icon: DiplomaIcon },
	"/_app/user/requests/": { label: "Contributi", icon: InboxIcon },
	"/_app/user/bookmarks": { label: "Segnalibri", icon: BookmarkIcon },
	"/_app/user/achievements": {
		label: "Traguardi",
		icon: MedalRibbonStarIcon,
		parents: [ANALYTICS],
	},
	"/_app/user/notifications": { label: "Notifiche", icon: InboxIcon },
	"/_app/user/settings": { label: "Impostazioni", icon: SettingsIcon },

	"/_app/user/analytics/": { label: "Analytics", icon: GraphUpIcon },
	"/_app/user/analytics/courses": {
		label: "Per corso",
		icon: LayersIcon,
		parents: [ANALYTICS],
	},
	"/_app/user/analytics/history": {
		label: "Storico",
		icon: HistoryIcon,
		parents: [ANALYTICS],
	},
	"/_app/user/analytics/class/$id": {
		label: ctx => fromFirstAttempt(ctx.loaderData, "className", "Insegnamento"),
		icon: BookIcon,
		parents: [ANALYTICS],
	},
	"/_app/user/analytics/course/$id": {
		label: ctx => fromFirstAttempt(ctx.loaderData, "courseName", "Corso"),
		icon: DiplomaIcon,
		parents: [ANALYTICS],
	},
	"/_app/user/analytics/section/$id": {
		label: ctx => fromFirstAttempt(ctx.loaderData, "sectionName", "Sezione"),
		icon: DocumentTextIcon,
		parents: [ANALYTICS],
	},

	// Browse also renders a trail of its own, for the guests who get no shell to
	// put one in — `BrowsePageHeader` drops it as soon as there is a header here.
	"/_app/browse/": { label: "Esplora", icon: CompassIcon },
	"/_app/browse/$department/": {
		label: ctx => dig(ctx.loaderData, "name") ?? "Dipartimento",
		icon: BuildingsIcon,
		parents: [BROWSE],
	},
	"/_app/browse/$department/$course/": {
		label: ctx => dig(ctx.loaderData, "name") ?? "Corso",
		icon: DiplomaIcon,
		parents: ctx => [BROWSE, department(ctx, "department.name")],
	},
	"/_app/browse/$department/$course/$class/": {
		label: ctx => dig(ctx.loaderData, "name") ?? "Insegnamento",
		icon: BookIcon,
		parents: ctx => [
			BROWSE,
			department(ctx, "course.department.name"),
			course(ctx, "course.name"),
		],
	},
	"/_app/browse/$department/$course/$class/$section/": {
		label: ctx => dig(ctx.loaderData, "name") ?? "Sezione",
		icon: DocumentTextIcon,
		parents: ctx => [
			BROWSE,
			department(ctx, "class.course.department.name"),
			course(ctx, "class.course.name"),
			classCrumb(ctx, "class.name"),
		],
	},

	"/_app/search/": { label: "Cerca", icon: MagnifierIcon },

	"/_app/admin/": { label: "Gestione", icon: ShieldIcon },
	"/_app/about": { label: "Chi siamo", icon: InfoCircleIcon },
	"/_app/news": { label: "Novità", icon: ConfettiIcon },
	"/_app/contact": { label: "Contatti", icon: LetterIcon },
};

/** Every trail in the app shell starts at the dashboard; it is the only fixed root. */
const DASHBOARD_ROUTE = "/_app/user/";
const DASHBOARD: Crumb = { label: "Dashboard", to: "/user", icon: HomeIcon };

export function useRouteCrumbs(): Crumb[] {
	const matches = useMatches();

	const trail = matches.flatMap<Crumb>(match => {
		const def = CRUMBS[match.routeId];
		if (!def) return [];

		const ctx: CrumbCtx = {
			loaderData: isMatch(match, "loaderData") ? match.loaderData : undefined,
			params: (match.params ?? {}) as Record<string, string>,
		};

		const parents = typeof def.parents === "function" ? def.parents(ctx) : def.parents;

		return [
			...(parents ?? []),
			{
				label: typeof def.label === "function" ? def.label(ctx) : def.label,
				icon: def.icon,
				to: match.pathname as Crumb["to"],
			},
		];
	});

	if (trail.length === 0) return [];

	// On the dashboard itself the route already produced that crumb.
	const onDashboard = matches.some(match => match.routeId === DASHBOARD_ROUTE);
	const items = onDashboard ? trail : [DASHBOARD, ...trail];

	// The page you are on is not a link to itself.
	return items.map((crumb, index) =>
		index === items.length - 1 ? { ...crumb, to: undefined, params: undefined } : crumb
	);
}
