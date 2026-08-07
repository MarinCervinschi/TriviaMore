import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Search, X } from "lucide-react";

import { BrowseTable } from "@/components/browse/browse-table";
import { UserClassesSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { UserHero } from "@/components/user/user-hero";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { seoHead } from "@/lib/seo";
import { useRemoveClass } from "@/lib/user/mutations";
import { userQueries } from "@/lib/user/queries";

export const Route = createFileRoute("/_app/user/classes")({
	loader: ({ context }) => context.queryClient.ensureQueryData(userQueries.classes()),
	head: () => seoHead({ title: "I Miei Corsi", noindex: true }),
	pendingComponent: UserClassesSkeleton,
	component: ClassesPage,
});

function ClassesPage() {
	const { data: userClasses } = useSuspenseQuery(userQueries.classes());
	const removeClass = useRemoveClass();

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState("all");
	const [selectedCourseType, setSelectedCourseType] = useState("all");
	const [sortBy, setSortBy] = useState("name");
	const [page, setPage] = useState(1);

	const departments = useMemo(() => {
		const depts = [...new Set(userClasses.map(uc => uc.departmentCode))];
		return depts.sort();
	}, [userClasses]);

	const courseTypes = useMemo(() => {
		const types = [...new Set(userClasses.map(uc => uc.courseType))];
		return types.sort();
	}, [userClasses]);

	const filtered = useMemo(() => {
		const result = userClasses.filter(uc => {
			const search = searchTerm.toLowerCase();
			const matchesSearch =
				!search ||
				uc.className.toLowerCase().includes(search) ||
				uc.courseName.toLowerCase().includes(search) ||
				uc.departmentCode.toLowerCase().includes(search) ||
				(uc.classCode ?? "").toLowerCase().includes(search);

			const matchesDept =
				selectedDepartment === "all" || uc.departmentCode === selectedDepartment;

			const matchesType =
				selectedCourseType === "all" || uc.courseType === selectedCourseType;

			return matchesSearch && matchesDept && matchesType;
		});

		result.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.className.localeCompare(b.className);
				case "department":
					return a.departmentCode.localeCompare(b.departmentCode);
				case "year":
					return (a.classYear ?? 0) - (b.classYear ?? 0);
				case "dateAdded":
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				default:
					return 0;
			}
		});

		return result;
	}, [userClasses, searchTerm, selectedDepartment, selectedCourseType, sortBy]);

	const pageSize = 10;
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const safePage = Math.min(page, totalPages);
	const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

	const hasActiveFilters =
		searchTerm || selectedDepartment !== "all" || selectedCourseType !== "all";

	const clearFilters = () => {
		setSearchTerm("");
		setSelectedDepartment("all");
		setSelectedCourseType("all");
		setSortBy("name");
		setPage(1);
	};

	return (
		<div className="space-y-8 pb-8">
			<UserHero
				icon={GraduationCap}
				title="I Miei Corsi"
				description="Gestisci i corsi che stai seguendo"
				stats={[
					{ label: "corsi totali", value: userClasses.length },
					{ label: "visualizzati", value: filtered.length },
				]}
			/>

			<div className="container space-y-6">
				<UserBreadcrumb current="I Miei Corsi" />

				{/* Search + Filters — inline toolbar */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative max-w-sm flex-1">
						<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							placeholder="Cerca corso, dipartimento..."
							value={searchTerm}
							onChange={e => {
								setSearchTerm(e.target.value);
								setPage(1);
							}}
							className="h-10 rounded-xl pl-10"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Select
							value={selectedDepartment}
							onValueChange={v => {
								setSelectedDepartment(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="h-10 w-auto min-w-[160px] rounded-xl">
								<SelectValue placeholder="Dipartimento" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i dipartimenti</SelectItem>
								{departments.map(dept => (
									<SelectItem key={dept} value={dept}>
										{dept}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={selectedCourseType}
							onValueChange={v => {
								setSelectedCourseType(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="h-10 w-auto min-w-[140px] rounded-xl">
								<SelectValue placeholder="Tipo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i tipi</SelectItem>
								{courseTypes.map(type => (
									<SelectItem key={type} value={type}>
										{COURSE_TYPE_CONFIG[type]?.label ?? type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="h-10 w-auto min-w-[140px] rounded-xl">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name">Nome</SelectItem>
								<SelectItem value="department">Dipartimento</SelectItem>
								<SelectItem value="year">Anno</SelectItem>
								<SelectItem value="dateAdded">Data Aggiunta</SelectItem>
							</SelectContent>
						</Select>

						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="text-muted-foreground hover:text-foreground rounded-full"
							>
								<X className="mr-1 h-3.5 w-3.5" />
								Pulisci
							</Button>
						)}
					</div>
				</div>

				{/* Classes Table */}
				{filtered.length === 0 ? (
					userClasses.length === 0 ? (
						<EmptyState
							icon={GraduationCap}
							title="Nessun corso salvato"
							description="Esplora i dipartimenti e aggiungi i corsi che ti interessano!"
							actionLabel="Esplora Corsi"
							actionHref="/browse"
						/>
					) : (
						<div className="bg-card relative overflow-hidden rounded-3xl border p-12">
							<div className="text-center">
								<h2 className="mb-2 text-xl font-semibold">Nessun corso trovato</h2>
								<p className="text-muted-foreground mb-4">
									Prova a modificare i filtri di ricerca.
								</p>
								<Button onClick={clearFilters} variant="outline" className="rounded-xl">
									Pulisci Filtri
								</Button>
							</div>
						</div>
					)
				) : (
					<>
						<BrowseTable
							headers={["Corso", "Dipartimento", "Tipo", "Anno", "Aggiunto", ""]}
						>
							{paged.map(userClass => (
								<tr key={userClass.classId} className="group">
									<td className="min-w-[16rem] py-4 pr-3 pl-6 align-top">
										<Link
											to="/browse/$department/$course/$class"
											params={{
												department: userClass.departmentCode.toLowerCase(),
												course: userClass.courseCode,
												class: (userClass.classCode ?? "").toLowerCase(),
											}}
											className="block"
										>
											<span className="text-foreground group-hover:text-primary block font-medium transition-colors">
												{userClass.className}
											</span>
											<p className="text-muted-foreground mt-0.5 text-xs">
												{userClass.courseName} &bull; {userClass.classCode}
											</p>
										</Link>
									</td>
									<td className="px-3 py-4 text-center whitespace-nowrap">
										<Badge variant="outline" className="text-xs">
											{userClass.departmentCode}
										</Badge>
									</td>
									<td className="px-3 py-4 text-center whitespace-nowrap">
										<Badge
											className={`rounded-full text-xs ${COURSE_TYPE_CONFIG[userClass.courseType]?.className ?? ""}`}
										>
											{COURSE_TYPE_CONFIG[userClass.courseType]?.label ??
												userClass.courseType}
										</Badge>
									</td>
									<td className="text-muted-foreground px-4 py-4 text-center text-sm">
										{userClass.classYear}
									</td>
									<td className="text-muted-foreground px-4 py-4 text-center text-xs">
										{new Date(userClass.createdAt).toLocaleDateString("it-IT")}
									</td>
									<td className="px-4 py-4 text-center">
										<Button
											variant="ghost"
											size="sm"
											onClick={e => {
												e.preventDefault();
												removeClass.mutate(userClass.classId);
											}}
											disabled={removeClass.isPending}
											className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg p-0"
											title="Rimuovi corso"
										>
											<X className="h-4 w-4" />
										</Button>
									</td>
									<td className="py-4 pr-6">
										<Link
											to="/browse/$department/$course/$class"
											params={{
												department: userClass.departmentCode.toLowerCase(),
												course: userClass.courseCode,
												class: (userClass.classCode ?? "").toLowerCase(),
											}}
											className="inline-flex"
											aria-label={`Apri ${userClass.className}`}
										>
											<ArrowRight className="text-muted-foreground/50 group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
										</Link>
									</td>
								</tr>
							))}
						</BrowseTable>
						<Pagination
							page={safePage}
							totalPages={totalPages}
							onPageChange={setPage}
							totalItems={filtered.length}
							pageSize={pageSize}
						/>
					</>
				)}
			</div>
		</div>
	);
}
