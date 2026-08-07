import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
	BookOpen,
	ChevronRight,
	FileQuestion,
	FolderOpen,
	GraduationCap,
	Inbox,
	LayoutDashboard,
	Library,
	type LucideIcon,
	Shield,
	Trophy,
	Users,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { adminQueries } from "@/lib/admin/queries";
import { getRoleTheme } from "@/lib/admin/role-theme";
import type {
	ContentTreeClass,
	ContentTreeCourse,
	ContentTreeDepartment,
} from "@/lib/admin/types";
import { requestQueries } from "@/lib/requests/queries";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
	const { user } = useAuth();
	const theme = getRoleTheme(user?.role);
	const RoleIcon = theme.icon;
	const isSuperadmin = user?.role === "SUPERADMIN";
	const isMaintainer = user?.role === "MAINTAINER";
	const { data: stats } = useQuery(adminQueries.stats());
	// SUPERADMIN-only (getAdminUserStatsFn); gating prevents requireSuperadmin
	// from redirecting MAINTAINER/ADMIN users to /user.
	const { data: userStats } = useQuery({
		...adminQueries.userStats(),
		enabled: isSuperadmin,
	});
	// Maintainers manage their own courses (shown in the dashboard), not
	// departments — skip the tree for them entirely.
	const { data: tree } = useQuery({
		...adminQueries.contentTree(),
		enabled: !isMaintainer,
	});
	const matchRoute = useMatchRoute();

	const { data: requestCount } = useQuery(requestQueries.adminRequestCount());

	const isDashboardActive = matchRoute({ to: "/admin", fuzzy: false });
	const isDeptActive = matchRoute({ to: "/admin/departments", fuzzy: true });
	const isUsersActive = matchRoute({ to: "/admin/users", fuzzy: true });
	const isRequestsActive = matchRoute({ to: "/admin/requests", fuzzy: true });

	return (
		<nav className="bg-card/50 rounded-2xl border p-4">
			<div
				className={cn(
					"mb-3 flex items-center gap-2 rounded-xl border px-3 py-2",
					theme.pillBorder,
					theme.pillBg
				)}
			>
				<RoleIcon
					className={cn("h-4 w-4 shrink-0", theme.pillText)}
					strokeWidth={1.5}
				/>
				<span
					className={cn("text-xs font-bold tracking-wider uppercase", theme.pillText)}
				>
					{theme.label}
				</span>
			</div>
			<p className="text-primary mb-2 px-3 text-xs font-semibold tracking-widest uppercase">
				Gestione
			</p>
			<div className="flex flex-col gap-0.5">
				{/* Dashboard */}
				<Link
					to="/admin"
					className={cn(
						"hover:bg-accent/50 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
						isDashboardActive && "bg-primary/10 text-primary font-semibold"
					)}
				>
					<LayoutDashboard className="h-4 w-4" />
					Dashboard
				</Link>

				{/* Dipartimenti — with file tree (hidden for maintainers) */}
				{!isMaintainer && (
					<DepartmentsTreeLink
						isActive={!!isDeptActive}
						tree={tree}
						departmentCount={stats?.departmentCount}
					/>
				)}

				{/* Utenti — SUPERADMIN only (/admin/users requires superadmin) */}
				{isSuperadmin && (
					<Link
						to="/admin/users"
						className={cn(
							"hover:bg-accent/50 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
							isUsersActive && "bg-primary/10 text-primary font-semibold"
						)}
					>
						<Users className="h-4 w-4" />
						Utenti
					</Link>
				)}

				{/* Richieste */}
				<Link
					to="/admin/requests"
					className={cn(
						"hover:bg-accent/50 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
						isRequestsActive && "bg-primary/10 text-primary font-semibold"
					)}
				>
					<Inbox className="h-4 w-4" />
					Richieste
					{(requestCount ?? 0) > 0 && (
						<span className="bg-primary text-primary-foreground ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
							{requestCount}
						</span>
					)}
				</Link>
			</div>

			{/* Stats: Contenuti */}
			<div className="border-border/50 my-4 border-t pt-4">
				<p className="text-primary mb-2 px-3 text-xs font-semibold tracking-widest uppercase">
					Contenuti
				</p>
				<div className="flex flex-col gap-0.5">
					<SidebarStat icon={GraduationCap} label="Corsi" count={stats?.courseCount} />
					<SidebarStat
						icon={FolderOpen}
						label="Insegnamenti"
						count={stats?.classCount}
					/>
					<SidebarStat icon={BookOpen} label="Sezioni" count={stats?.sectionCount} />
					<SidebarStat
						icon={FileQuestion}
						label="Domande"
						count={stats?.questionCount}
					/>
				</div>
			</div>

			{/* Stats: Utenti — SUPERADMIN only */}
			{isSuperadmin && (
				<div className="border-border/50 border-t pt-4">
					<p className="text-primary mb-2 px-3 text-xs font-semibold tracking-widest uppercase">
						Utenti
					</p>
					<div className="flex flex-col gap-0.5">
						<SidebarStat
							icon={Users}
							label="Registrati"
							count={userStats?.totalUsers}
						/>
						<SidebarStat
							icon={Shield}
							label="Admin"
							count={
								(userStats?.byRole?.SUPERADMIN ?? 0) +
								(userStats?.byRole?.ADMIN ?? 0) +
								(userStats?.byRole?.MAINTAINER ?? 0)
							}
						/>
						<SidebarStat
							icon={Trophy}
							label="Quiz completati"
							count={userStats?.totalQuizAttempts}
						/>
					</div>
				</div>
			)}
		</nav>
	);
}

// ─── Dipartimenti link with expandable file tree ───

function DepartmentsTreeLink({
	isActive,
	tree,
	departmentCount,
}: {
	isActive: boolean;
	tree?: ContentTreeDepartment[];
	departmentCount?: number;
}) {
	const [open, setOpen] = useState(false);
	const hasTree = tree && tree.length > 0;

	return (
		<div>
			<div
				className={cn(
					"hover:bg-accent/50 flex items-center rounded-xl transition-colors",
					isActive && "bg-primary/10"
				)}
			>
				{/* Chevron toggle */}
				<button
					onClick={() => hasTree && setOpen(!open)}
					className="shrink-0 px-2 py-2"
				>
					<ChevronRight
						className={cn(
							"text-muted-foreground/50 h-3.5 w-3.5 transition-transform duration-200",
							open && "rotate-90",
							!hasTree && "invisible"
						)}
					/>
				</button>

				{/* Main link */}
				<Link
					to="/admin/departments"
					className={cn(
						"flex flex-1 items-center gap-2 py-2 pr-3 text-sm font-medium",
						isActive ? "text-primary font-semibold" : "text-foreground"
					)}
				>
					<Library className="h-4 w-4" />
					<span className="flex-1">Dipartimenti</span>
					{departmentCount !== undefined && (
						<span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
							{departmentCount}
						</span>
					)}
				</Link>
			</div>

			{/* File tree */}
			{open && hasTree && (
				<div className="border-border/40 mt-0.5 ml-4 border-l pl-1">
					{tree.map(dept => (
						<DepartmentNode key={dept.id} department={dept} />
					))}
				</div>
			)}
		</div>
	);
}

// ─── Tree nodes ───

function DepartmentNode({ department }: { department: ContentTreeDepartment }) {
	const [open, setOpen] = useState(false);
	const hasCourses = department.courses.length > 0;

	return (
		<div>
			<button
				onClick={() => hasCourses && setOpen(!open)}
				className="hover:bg-accent/50 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors"
			>
				<ChevronRight
					className={cn(
						"text-muted-foreground/50 h-3 w-3 shrink-0 transition-transform duration-200",
						open && "rotate-90",
						!hasCourses && "invisible"
					)}
				/>
				<Library className="h-3.5 w-3.5 shrink-0 text-blue-500" />
				<Link
					to="/admin/departments/$departmentId"
					params={{ departmentId: department.id }}
					className="text-foreground hover:text-primary flex-1 truncate text-left"
					onClick={e => e.stopPropagation()}
				>
					{department.name}
				</Link>
				<span className="text-muted-foreground/50 shrink-0 text-[10px]">
					{department.courses.length}
				</span>
			</button>

			{open && hasCourses && (
				<div className="border-border/40 ml-3 border-l pl-1">
					{department.courses.map(course => (
						<CourseNode key={course.id} course={course} />
					))}
				</div>
			)}
		</div>
	);
}

function CourseNode({ course }: { course: ContentTreeCourse }) {
	const [open, setOpen] = useState(false);
	const hasClasses = course.classes.length > 0;

	return (
		<div>
			<button
				onClick={() => hasClasses && setOpen(!open)}
				className="hover:bg-accent/50 flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors"
			>
				<ChevronRight
					className={cn(
						"text-muted-foreground/50 h-3 w-3 shrink-0 transition-transform duration-200",
						open && "rotate-90",
						!hasClasses && "invisible"
					)}
				/>
				<GraduationCap className="h-3.5 w-3.5 shrink-0 text-green-500" />
				<Link
					to="/admin/courses/$courseId"
					params={{ courseId: course.id }}
					className="text-foreground hover:text-primary flex-1 truncate text-left"
					onClick={e => e.stopPropagation()}
				>
					{course.name}
				</Link>
				<span className="text-muted-foreground/50 shrink-0 text-[10px]">
					{course.classes.length}
				</span>
			</button>

			{open && hasClasses && (
				<div className="border-border/40 ml-3 border-l pl-1">
					{course.classes.map(cls => (
						<ClassNode key={cls.id} cls={cls} />
					))}
				</div>
			)}
		</div>
	);
}

function ClassNode({ cls }: { cls: ContentTreeClass }) {
	const [open, setOpen] = useState(false);
	const hasSections = cls.sections.length > 0;

	return (
		<div>
			<button
				onClick={() => hasSections && setOpen(!open)}
				className="hover:bg-accent/50 flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors"
			>
				<ChevronRight
					className={cn(
						"text-muted-foreground/50 h-3 w-3 shrink-0 transition-transform duration-200",
						open && "rotate-90",
						!hasSections && "invisible"
					)}
				/>
				<FolderOpen className="h-3.5 w-3.5 shrink-0 text-orange-500" />
				<Link
					to="/admin/classes/$classId"
					params={{ classId: cls.id }}
					className="text-foreground hover:text-primary flex-1 truncate text-left"
					onClick={e => e.stopPropagation()}
				>
					{cls.name}
				</Link>
				<span className="text-muted-foreground/50 shrink-0 text-[10px]">
					{cls.sections.length}
				</span>
			</button>

			{open && hasSections && (
				<div className="border-border/40 ml-3 border-l pl-1">
					{cls.sections.map(section => (
						<Link
							key={section.id}
							to="/admin/sections/$sectionId"
							params={{ sectionId: section.id }}
							className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors"
						>
							<span className="h-3 w-3" />
							<BookOpen className="h-3.5 w-3.5 shrink-0 text-purple-500" />
							<span className="text-foreground hover:text-primary flex-1 truncate">
								{section.name}
							</span>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

// ─── Stat row ───

function SidebarStat({
	icon: Icon,
	label,
	count,
}: {
	icon: LucideIcon;
	label: string;
	count?: number;
}) {
	return (
		<div className="text-muted-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
			<Icon className="h-4 w-4" />
			<span className="flex-1">{label}</span>
			{count !== undefined && (
				<span className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
					{count}
				</span>
			)}
		</div>
	);
}
