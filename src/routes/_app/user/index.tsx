import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { InboxIcon } from "@solar-icons/react/linear/inbox";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import {
	DataTable,
	createDataTableColumns,
	useDataTable,
} from "@/components/data-table";
import { decorativeTint } from "@/components/shared/decorative-tints";
import { StatCard } from "@/components/shared/stat-card";
import { UserDashboardSkeleton } from "@/components/skeletons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardTexture } from "@/components/ui/card";
import { ActivitySection } from "@/components/user/activity-section";
import { UserHero } from "@/components/user/user-hero";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import type { RecentClass } from "@/lib/user/types";
import { getDisplayName, getInitials, getRoleLabel } from "@/lib/user/utils";
import { formatDate } from "@/lib/utils/format";

export const Route = createFileRoute("/_app/user/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(userQueries.profile()),
	head: () => seoHead({ title: "Dashboard", noindex: true }),
	pendingComponent: UserDashboardSkeleton,
	component: DashboardPage,
});

function DashboardPage() {
	const { data: profile } = useSuspenseQuery(userQueries.profile());

	if (!profile) return null;

	const displayName = getDisplayName(profile);
	const initials = getInitials(profile);

	return (
		<div className="space-y-8 pb-8">
			{/* Hero */}
			<UserHero icon={CupFirstIcon} title="" description="">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-center">
					<Avatar className="border-background ring-primary/20 h-16 w-16 shrink-0 border-4 shadow-xl ring-2 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
						<AvatarImage src={profile.image ?? undefined} alt={displayName} />
						<AvatarFallback className="bg-primary/10 text-brand text-xl font-bold sm:text-2xl">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
							Ciao, <span className="gradient-text break-words">{displayName}</span>
						</h1>
						<div className="mb-3 flex items-center gap-2">
							<Badge className="border-primary/20 bg-primary/5 text-brand border px-3 py-1 text-xs font-medium backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-sm">
								{getRoleLabel(profile.role)}
							</Badge>
						</div>
						<div className="text-muted-foreground flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
							{profile.email && (
								<div className="flex min-w-0 items-center gap-1.5">
									<LetterIcon className="h-4 w-4 shrink-0" />
									<span className="truncate text-sm">{profile.email}</span>
								</div>
							)}
							<div className="flex items-center gap-1.5">
								<CalendarMinimalisticIcon className="h-4 w-4 shrink-0" />
								<span className="text-sm">
									Membro dal {formatDate(profile.createdAt)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</UserHero>

			<div className="container space-y-8">
				{/* Stats */}
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<StatCard
						label="Quiz completati"
						value={profile.stats.totalQuizzes}
						icon={CupFirstIcon}
						color="yellow"
					/>
					<StatCard
						label="Punteggio medio"
						value={`${profile.stats.averageScore}/33`}
						icon={GraphUpIcon}
						color="green"
					/>
					<StatCard
						label="Insegnamenti seguiti"
						value={profile.stats.userClassesCount}
						icon={DiplomaIcon}
						color="blue"
					/>
					<StatCard
						label="Segnalibri"
						value={profile.stats.bookmarksCount}
						icon={BookmarkIcon}
						color="purple"
					/>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<QuickActionCard
						icon={InboxIcon}
						color="amber"
						title="I miei contributi"
						description="Proponi nuovi contenuti per la piattaforma"
						href="/user/requests"
					/>
					<QuickActionCard
						icon={GraphUpIcon}
						color="green"
						title="I miei progressi"
						description="Visualizza i tuoi progressi dettagliati per ogni materia"
						href="/user/progress"
					/>
					<QuickActionCard
						icon={DiplomaIcon}
						color="blue"
						title="I miei insegnamenti"
						description="Gestisci gli insegnamenti che stai seguendo"
						href="/user/classes"
					/>
					<QuickActionCard
						icon={BookmarkIcon}
						color="purple"
						title="I miei segnalibri"
						description="Accedi alle domande che hai salvato per dopo"
						href="/user/bookmarks"
					/>
				</div>

				{/* Recent Classes */}
				{profile.recentClasses.length > 0 && (
					<RecentClassesSection classes={profile.recentClasses} />
				)}

				<ActivitySection
					data={profile.activity.days}
					endDate={profile.activity.endDate}
					attempts={profile.recentQuizAttempts}
				/>
			</div>
		</div>
	);
}

function QuickActionCard({
	icon: Icon,
	color,
	title,
	description,
	href,
}: {
	icon: typeof CupFirstIcon;
	color: string;
	title: string;
	description: string;
	href: string;
}) {
	const colors = decorativeTint(color);

	return (
		<Link
			to={href}
			className={`group relative overflow-hidden rounded-2xl border ${colors.border} bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
		>
			<CardTexture placement="tl" alpha={0.12} />

			<div className="relative">
				<div className={`mb-4 inline-flex rounded-2xl ${colors.badge} p-3`}>
					<Icon className={`h-6 w-6 ${colors.icon}`} />
				</div>
				<h3 className="mb-1 text-lg font-semibold tracking-tight">{title}</h3>
				<p className="text-muted-foreground mb-4 text-sm">{description}</p>
				<div className="text-brand flex items-center gap-1 text-sm font-medium">
					Vai
					<ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
				</div>
			</div>
		</Link>
	);
}

function RecentClassesSection({ classes }: { classes: RecentClass[] }) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-brand eyebrow-lg">I tuoi insegnamenti</p>
					<h2 className="text-xl font-bold">Insegnamenti visti di recente</h2>
				</div>
				<Button asChild variant="ghost" size="sm" className="group">
					<Link to="/user/classes" className="flex items-center gap-1">
						<DiplomaIcon className="h-4 w-4" />
						Tutti gli insegnamenti
						<ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
					</Link>
				</Button>
			</div>

			<RecentClassesTable classes={classes} />
		</div>
	);
}

const recentClassColumn = createDataTableColumns<RecentClass>();

function recentClassParams(item: RecentClass) {
	return {
		department: item.departmentCode.toLowerCase(),
		course: item.courseCode.toLowerCase(),
		class: (item.classCode ?? "").toLowerCase(),
	};
}

const recentClassColumns = [
	recentClassColumn.accessor("className", {
		header: "Insegnamento",
		enableSorting: false,
		meta: { label: "Insegnamento", cellClassName: "min-w-[16rem]" },
		cell: ({ row }) => (
			<Link
				to="/browse/$department/$course/$class"
				params={recentClassParams(row.original)}
			>
				<span className="text-foreground group-hover:text-brand block font-medium transition-colors">
					{row.original.className}
				</span>
				<p className="text-muted-foreground mt-0.5 text-xs">
					{row.original.courseName}
				</p>
			</Link>
		),
	}),
	recentClassColumn.accessor("departmentCode", {
		header: "Dipartimento",
		enableSorting: false,
		meta: { label: "Dipartimento", align: "center" },
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original.departmentCode}
			</Badge>
		),
	}),
	recentClassColumn.accessor("courseType", {
		header: "Tipo",
		enableSorting: false,
		meta: { label: "Tipo", align: "center" },
		cell: ({ row }) => (
			<Badge
				className={`text-xs ${COURSE_TYPE_CONFIG[row.original.courseType]?.className ?? ""}`}
			>
				{COURSE_TYPE_CONFIG[row.original.courseType]?.label ?? row.original.courseType}
			</Badge>
		),
	}),
	recentClassColumn.accessor("classYear", {
		header: "Anno",
		enableSorting: false,
		meta: {
			label: "Anno",
			align: "center",
			cellClassName: "text-muted-foreground text-sm",
		},
	}),
];

function RecentClassesTable({ classes }: { classes: RecentClass[] }) {
	const table = useDataTable({
		data: classes,
		columns: recentClassColumns,
		getRowId: row => row.classId,
		pageSize: Math.max(classes.length, 1),
	});

	return (
		<DataTable
			table={table}
			showPagination={false}
			rowLink={row => (
				<Link
					to="/browse/$department/$course/$class"
					params={recentClassParams(row)}
					aria-label={`Apri ${row.className}`}
				/>
			)}
		/>
	);
}
