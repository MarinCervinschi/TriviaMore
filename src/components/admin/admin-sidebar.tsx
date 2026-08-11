import { useState } from "react";

import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { BookIcon } from "@solar-icons/react/linear/book";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { FolderOpenIcon } from "@solar-icons/react/linear/folder-open";
import { InboxIcon } from "@solar-icons/react/linear/inbox";
import { LibraryIcon } from "@solar-icons/react/linear/library";
import { QuestionSquareIcon } from "@solar-icons/react/linear/question-square";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import { UsersGroupRoundedIcon } from "@solar-icons/react/linear/users-group-rounded";
import { Widget2Icon } from "@solar-icons/react/linear/widget-2";
import { useQuery } from "@tanstack/react-query";
import { Link, useMatchRoute } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
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
				<RoleIcon className={cn("h-4 w-4 shrink-0", theme.pillText)} />
				<span className={cn("eyebrow", theme.pillText)}>{theme.label}</span>
			</div>
			<p className="text-brand eyebrow mb-2 px-3">Gestione</p>
			<div className="flex flex-col gap-0.5">
				{/* Dashboard */}
				<Link
					to="/admin"
					className={cn(
						"hover:bg-accent/50 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
						isDashboardActive && "bg-primary/10 text-brand font-semibold"
					)}
				>
					<Widget2Icon className="h-4 w-4" />
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
							isUsersActive && "bg-primary/10 text-brand font-semibold"
						)}
					>
						<UsersGroupRoundedIcon className="h-4 w-4" />
						Utenti
					</Link>
				)}

				{/* Richieste */}
				<Link
					to="/admin/requests"
					className={cn(
						"hover:bg-accent/50 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
						isRequestsActive && "bg-primary/10 text-brand font-semibold"
					)}
				>
					<InboxIcon className="h-4 w-4" />
					Richieste
					{(requestCount ?? 0) > 0 && (
						<span className="bg-primary text-primary-foreground text-2xs ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-bold">
							{requestCount}
						</span>
					)}
				</Link>
			</div>

			{/* Stats: Contenuti */}
			<div className="border-border/50 my-4 border-t pt-4">
				<p className="text-brand eyebrow mb-2 px-3">Contenuti</p>
				<div className="flex flex-col gap-0.5">
					<SidebarStat icon={DiplomaIcon} label="Corsi" count={stats?.courseCount} />
					<SidebarStat
						icon={FolderOpenIcon}
						label="Insegnamenti"
						count={stats?.classCount}
					/>
					<SidebarStat icon={BookIcon} label="Sezioni" count={stats?.sectionCount} />
					<SidebarStat
						icon={QuestionSquareIcon}
						label="Domande"
						count={stats?.questionCount}
					/>
				</div>
			</div>

			{/* Stats: Utenti — SUPERADMIN only */}
			{isSuperadmin && (
				<div className="border-border/50 border-t pt-4">
					<p className="text-brand eyebrow mb-2 px-3">Utenti</p>
					<div className="flex flex-col gap-0.5">
						<SidebarStat
							icon={UsersGroupRoundedIcon}
							label="Registrati"
							count={userStats?.totalUsers}
						/>
						<SidebarStat
							icon={ShieldIcon}
							label="Admin"
							count={
								(userStats?.byRole?.SUPERADMIN ?? 0) +
								(userStats?.byRole?.ADMIN ?? 0) +
								(userStats?.byRole?.MAINTAINER ?? 0)
							}
						/>
						<SidebarStat
							icon={CupFirstIcon}
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
					<AltArrowRightIcon
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
						isActive ? "text-brand font-semibold" : "text-foreground"
					)}
				>
					<LibraryIcon className="h-4 w-4" />
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
				<AltArrowRightIcon
					className={cn(
						"text-muted-foreground/50 h-3 w-3 shrink-0 transition-transform duration-200",
						open && "rotate-90",
						!hasCourses && "invisible"
					)}
				/>
				<LibraryIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
				<Link
					to="/admin/departments/$departmentId"
					params={{ departmentId: department.id }}
					className="text-foreground hover:text-brand flex-1 truncate text-left"
					onClick={e => e.stopPropagation()}
				>
					{department.name}
				</Link>
				<span className="text-muted-foreground/50 text-2xs shrink-0">
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
				<AltArrowRightIcon
					className={cn(
						"text-muted-foreground/50 h-3 w-3 shrink-0 transition-transform duration-200",
						open && "rotate-90",
						!hasClasses && "invisible"
					)}
				/>
				<DiplomaIcon className="h-3.5 w-3.5 shrink-0 text-green-500" />
				<Link
					to="/admin/courses/$courseId"
					params={{ courseId: course.id }}
					className="text-foreground hover:text-brand flex-1 truncate text-left"
					onClick={e => e.stopPropagation()}
				>
					{course.name}
				</Link>
				<span className="text-muted-foreground/50 text-2xs shrink-0">
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
				<AltArrowRightIcon
					className={cn(
						"text-muted-foreground/50 h-3 w-3 shrink-0 transition-transform duration-200",
						open && "rotate-90",
						!hasSections && "invisible"
					)}
				/>
				<FolderOpenIcon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
				<Link
					to="/admin/classes/$classId"
					params={{ classId: cls.id }}
					className="text-foreground hover:text-brand flex-1 truncate text-left"
					onClick={e => e.stopPropagation()}
				>
					{cls.name}
				</Link>
				<span className="text-muted-foreground/50 text-2xs shrink-0">
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
							<BookIcon className="h-3.5 w-3.5 shrink-0 text-purple-500" />
							<span className="text-foreground hover:text-brand flex-1 truncate">
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
	icon: Icon;
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
