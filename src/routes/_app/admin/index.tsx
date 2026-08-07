import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	BookOpen,
	FileQuestion,
	FolderOpen,
	GraduationCap,
	LayoutDashboard,
	Library,
	Target,
	Trophy,
	Users,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
	DataTable,
	createDataTableColumns,
	useDataTable,
} from "@/components/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { adminQueries } from "@/lib/admin/queries";
import { seoHead } from "@/lib/seo";

type MaintainedCourse = { id: string; name: string; code: string };

const column = createDataTableColumns<MaintainedCourse>();

const maintainedCourseColumns = [
	column.accessor("name", {
		header: "Corso",
		enableSorting: false,
		meta: { label: "Corso" },
		cell: ({ row }) => (
			<Link
				to="/admin/courses/$courseId"
				params={{ courseId: row.original.id }}
				className="font-medium hover:underline"
			>
				{row.original.name}
			</Link>
		),
	}),
	column.accessor("code", {
		header: "Codice",
		enableSorting: false,
		meta: { label: "Codice" },
		cell: ({ row }) => (
			<Badge variant="secondary" className="rounded-full">
				{row.original.code}
			</Badge>
		),
	}),
];

export const Route = createFileRoute("/_app/admin/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.stats()),
	component: AdminDashboard,
	head: () => seoHead({ title: "Gestione Contenuti", noindex: true }),
});

function AdminDashboard() {
	const { user } = useAuth();
	const isSuperadmin = user?.role === "SUPERADMIN";
	const { data: stats } = useSuspenseQuery(adminQueries.stats());
	// User stats are SUPERADMIN-only (getAdminUserStatsFn). Running this query as
	// a MAINTAINER/ADMIN would trigger requireSuperadmin's redirect to /user.
	const { data: userStats } = useQuery({
		...adminQueries.userStats(),
		enabled: isSuperadmin,
	});
	const { data: myCourses } = useQuery(adminQueries.myMaintainedCourses());

	const contentCards = [
		{
			label: "Dipartimenti",
			value: stats.departmentCount,
			icon: Library,
			to: "/admin/departments",
			color: "blue",
		},
		{
			label: "Corsi",
			value: stats.courseCount,
			icon: GraduationCap,
			to: "/admin/departments",
			color: "green",
		},
		{
			label: "Insegnamenti",
			value: stats.classCount,
			icon: FolderOpen,
			to: "/admin/departments",
			color: "orange",
		},
		{
			label: "Sezioni",
			value: stats.sectionCount,
			icon: BookOpen,
			to: "/admin/departments",
			color: "purple",
		},
		{
			label: "Domande",
			value: stats.questionCount,
			icon: FileQuestion,
			to: "/admin/departments",
			color: "red",
		},
	];

	return (
		<div className="py-2">
			<AdminPageHeader
				icon={LayoutDashboard}
				title="Gestione Contenuti"
				description="Panoramica della piattaforma"
			/>

			{/* Content stats */}
			<p className="text-primary mb-4 text-xs font-semibold tracking-widest uppercase">
				Contenuti
			</p>
			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{contentCards.map(card => (
					<StatCard
						key={card.label}
						label={card.label}
						value={card.value}
						icon={card.icon}
						color={card.color}
						href={card.to}
					/>
				))}
			</div>

			{/* User stats */}
			{userStats && (
				<>
					<p className="text-primary mb-4 text-xs font-semibold tracking-widest uppercase">
						Utenti e Utilizzo
					</p>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard
							label="Utenti totali"
							value={userStats.totalUsers}
							icon={Users}
							color="blue"
							href="/admin/users"
							subtitle={Object.entries(userStats.byRole)
								.map(
									([role, count]) =>
										`${role === "STUDENT" ? "Studenti" : role === "ADMIN" ? "Admin" : role === "MAINTAINER" ? "Maintainer" : "Superadmin"}: ${count}`
								)
								.join(" · ")}
						/>
						<StatCard
							label="Quiz completati"
							value={userStats.totalQuizAttempts}
							icon={Trophy}
							color="yellow"
							subtitle={`${userStats.recentQuizAttempts} negli ultimi 30 giorni`}
						/>
						<StatCard
							label="Punteggio medio"
							value={
								userStats.averageScore != null
									? `${Math.round((userStats.averageScore / 33) * 100)}%`
									: "—"
							}
							icon={Target}
							color="green"
						/>
						<StatCard
							label="Utenti attivi"
							value={userStats.activeUsers}
							icon={Users}
							color="purple"
							subtitle="con almeno 1 quiz completato"
						/>
					</div>
				</>
			)}

			{/* My maintained courses */}
			{(myCourses ?? []).length > 0 && (
				<div className="mt-8">
					<p className="text-primary mb-4 text-xs font-semibold tracking-widest uppercase">
						I miei corsi mantenuti
					</p>
					<MaintainedCoursesTable courses={myCourses ?? []} />
				</div>
			)}
		</div>
	);
}

function MaintainedCoursesTable({ courses }: { courses: MaintainedCourse[] }) {
	const table = useDataTable({
		data: courses,
		columns: maintainedCourseColumns,
		getRowId: row => row.id,
		pageSize: courses.length || 1,
	});

	return (
		<DataTable
			table={table}
			density="compact"
			showPagination={false}
			rowLink={row => (
				<Link
					to="/admin/courses/$courseId"
					params={{ courseId: row.id }}
					aria-label={`Apri ${row.name}`}
				/>
			)}
		/>
	);
}
