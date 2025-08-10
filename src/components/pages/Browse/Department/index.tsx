"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { BookOpen, ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Course {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseType: "BACHELOR" | "MASTER";
	position: number;
	departmentId: string;
	_count: {
		classes: number;
	};
}

interface Department {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	position: number;
	_count: {
		courses: number;
	};
	courses: Course[];
}

interface DepartmentPageComponentProps {
	department: Department;
	filters: {
		type?: "BACHELOR" | "MASTER";
		year?: string;
		search?: string;
	};
}

export default function DepartmentPageComponent({
	department,
	filters,
}: DepartmentPageComponentProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchValue, setSearchValue] = useState(filters.search || "");
	const [showFilters, setShowFilters] = useState(false);

	const updateFilters = (newFilters: Partial<typeof filters>) => {
		const params = new URLSearchParams(searchParams);

		// Aggiorna i parametri
		Object.entries(newFilters).forEach(([key, value]) => {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		});

		// Naviga con i nuovi parametri
		router.push(`/browse/${department.code.toLowerCase()}?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		updateFilters({ search: searchValue || undefined });
	};

	const clearFilters = () => {
		setSearchValue("");
		router.push(`/browse/${department.code.toLowerCase()}`);
	};

	const bachelorCourses = department.courses.filter(c => c.courseType === "BACHELOR");
	const masterCourses = department.courses.filter(c => c.courseType === "MASTER");
	const hasActiveFilters = filters.search || filters.type;

	return (
		<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-8">
				{/* Breadcrumb */}
				<nav className="mb-8">
					<div className="flex items-center space-x-2 text-sm">
						<Link
							href="/browse"
							className="flex items-center text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
						>
							<ChevronLeft className="mr-1 h-4 w-4" />
							Tutti i Dipartimenti
						</Link>
						<span className="text-gray-400 dark:text-gray-500">/</span>
						<span className="font-medium text-gray-900 dark:text-white">
							{department.name}
						</span>
					</div>
				</nav>{" "}
				{/* Header */}
				{/* Header */}
				<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between">
						<div className="mb-6 flex-1 md:mb-0">
							<div className="mb-4 flex items-center space-x-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
									<BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
										{department.name}
									</h1>
									<p className="font-medium text-blue-600 dark:text-blue-400">
										{department.code}
									</p>
								</div>
							</div>
							{department.description && (
								<p className="max-w-3xl leading-relaxed text-gray-600 dark:text-gray-300">
									{department.description}
								</p>
							)}
						</div>

						<div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/50">
							<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{department._count.courses}
							</div>
							<div className="text-sm text-blue-700 dark:text-blue-300">
								{department._count.courses === 1 ? "Corso" : "Corsi"} Disponibili
							</div>
						</div>
					</div>
				</div>{" "}
				{/* Filters */}
				<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							Cerca e Filtra
						</h2>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowFilters(!showFilters)}
							className="md:hidden"
						>
							<Filter className="mr-2 h-4 w-4" />
							Filtri
						</Button>
					</div>

					<div className={`space-y-4 ${showFilters ? "block" : "hidden md:block"}`}>
						<div className="flex flex-col gap-4 md:flex-row">
							{/* Search */}
							<div className="flex-1">
								<form onSubmit={handleSearch} className="flex gap-2">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
										<Input
											type="text"
											placeholder="Cerca per nome, codice o descrizione..."
											value={searchValue}
											onChange={e => setSearchValue(e.target.value)}
											className="pl-10"
										/>
									</div>
									<Button type="submit" className="shrink-0">
										Cerca
									</Button>
								</form>
							</div>

							{/* Type Filter */}
							<div className="md:w-48">
								<Select
									value={filters.type || "all"}
									onValueChange={value =>
										updateFilters({
											type:
												value === "all" ? undefined : (value as "BACHELOR" | "MASTER"),
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Tipo corso" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Tutti i tipi</SelectItem>
										<SelectItem value="BACHELOR">Laurea Triennale</SelectItem>
										<SelectItem value="MASTER">Laurea Magistrale</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Clear Filters */}
							{hasActiveFilters && (
								<Button variant="outline" onClick={clearFilters} className="shrink-0">
									<X className="mr-2 h-4 w-4" />
									Rimuovi Filtri
								</Button>
							)}
						</div>
					</div>
				</div>
				{/* Results */}
				{department.courses.length === 0 ? (
					<div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
							<BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
						</div>
						<h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
							Nessun corso trovato
						</h3>
						<p className="mb-6 text-gray-600 dark:text-gray-300">
							Non ci sono corsi che corrispondono ai filtri selezionati.
						</p>
						{hasActiveFilters && (
							<Button variant="outline" onClick={clearFilters}>
								Rimuovi Filtri
							</Button>
						)}
					</div>
				) : (
					<div className="space-y-12">
						{/* Bachelor Courses */}
						{(!filters.type || filters.type === "BACHELOR") &&
							bachelorCourses.length > 0 && (
								<div>
									<div className="mb-6 flex items-center">
										<div className="rounded-lg bg-blue-100 px-4 py-2 dark:bg-blue-900/50">
											<h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">
												Lauree Triennali
											</h2>
										</div>
										<div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
											{bachelorCourses.length}{" "}
											{bachelorCourses.length === 1 ? "corso" : "corsi"}
										</div>
									</div>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
										{bachelorCourses.map(course => (
											<Link
												key={course.id}
												href={`/browse/${department.code.toLowerCase()}/${course.code.toLowerCase()}`}
												className="group relative"
											>
												<div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
													<div className="mb-4 flex items-start justify-between">
														<div className="flex-1">
															<h3 className="mb-1 font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
																{course.name}
															</h3>
															<p className="text-sm font-medium text-blue-600 dark:text-blue-400">
																{course.code}
															</p>
														</div>
														<ChevronRight className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400" />
													</div>

													{course.description && (
														<p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
															{course.description}
														</p>
													)}

													<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
														<div className="flex items-center space-x-2">
															<BookOpen className="h-4 w-4 text-blue-500 dark:text-blue-400" />
															<span className="text-sm text-gray-700 dark:text-gray-300">
																{course._count.classes}{" "}
																{course._count.classes === 1 ? "classe" : "classi"}
															</span>
														</div>
														<div className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
															Triennale
														</div>
													</div>
												</div>
											</Link>
										))}
									</div>
								</div>
							)}

						{/* Master Courses */}
						{(!filters.type || filters.type === "MASTER") &&
							masterCourses.length > 0 && (
								<div>
									<div className="mb-6 flex items-center">
										<div className="rounded-lg bg-purple-100 px-4 py-2 dark:bg-purple-900/50">
											<h2 className="text-xl font-bold text-purple-800 dark:text-purple-200">
												Lauree Magistrali
											</h2>
										</div>
										<div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
											{masterCourses.length}{" "}
											{masterCourses.length === 1 ? "corso" : "corsi"}
										</div>
									</div>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
										{masterCourses.map(course => (
											<Link
												key={course.id}
												href={`/browse/${department.code.toLowerCase()}/${course.code.toLowerCase()}`}
												className="group relative"
											>
												<div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
													<div className="mb-4 flex items-start justify-between">
														<div className="flex-1">
															<h3 className="mb-1 font-bold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
																{course.name}
															</h3>
															<p className="text-sm font-medium text-purple-600 dark:text-purple-400">
																{course.code}
															</p>
														</div>
														<ChevronRight className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-600 dark:text-gray-500 dark:group-hover:text-purple-400" />
													</div>

													{course.description && (
														<p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
															{course.description}
														</p>
													)}

													<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
														<div className="flex items-center space-x-2">
															<BookOpen className="h-4 w-4 text-purple-500 dark:text-purple-400" />
															<span className="text-sm text-gray-700 dark:text-gray-300">
																{course._count.classes}{" "}
																{course._count.classes === 1 ? "classe" : "classi"}
															</span>
														</div>
														<div className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
															Magistrale
														</div>
													</div>
												</div>
											</Link>
										))}
									</div>
								</div>
							)}
					</div>
				)}
			</div>
		</div>
	);
}
