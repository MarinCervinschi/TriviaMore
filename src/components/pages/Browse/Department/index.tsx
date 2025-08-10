"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
		router.push(`/browse/${department.code}?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		updateFilters({ search: searchValue || undefined });
	};

	const clearFilters = () => {
		setSearchValue("");
		router.push(`/browse/${department.code}`);
	};

	const bachelorCourses = department.courses.filter(c => c.courseType === "BACHELOR");
	const masterCourses = department.courses.filter(c => c.courseType === "MASTER");

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<nav className="mb-6 text-sm text-muted-foreground">
				<Link href="/browse" className="hover:text-foreground">
					Browse
				</Link>
				<span className="mx-2">/</span>
				<span className="text-foreground">{department.name}</span>
			</nav>

			{/* Header */}
			<div className="mb-8">
				<h1 className="mb-4 text-3xl font-bold">{department.name}</h1>
				<p className="text-lg text-muted-foreground">{department.description}</p>
				<p className="mt-2 text-sm text-muted-foreground">
					{department._count.courses} courses available
				</p>
			</div>

			{/* Filters */}
			<div className="mb-6 flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-end">
				<div className="flex-1">
					<label htmlFor="search" className="mb-2 block text-sm font-medium">
						Search courses
					</label>
					<form onSubmit={handleSearch} className="flex gap-2">
						<Input
							id="search"
							type="text"
							placeholder="Search by name, code, or description..."
							value={searchValue}
							onChange={e => setSearchValue(e.target.value)}
							className="flex-1"
						/>
						<Button type="submit">Search</Button>
					</form>
				</div>

				<div className="min-w-[150px]">
					<label htmlFor="type" className="mb-2 block text-sm font-medium">
						Course Type
					</label>
					<Select
						value={filters.type || "all"}
						onValueChange={value =>
							updateFilters({
								type: value === "all" ? undefined : (value as "BACHELOR" | "MASTER"),
							})
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="All types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All types</SelectItem>
							<SelectItem value="BACHELOR">Bachelor</SelectItem>
							<SelectItem value="MASTER">Master</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{(filters.search || filters.type) && (
					<Button variant="outline" onClick={clearFilters}>
						Clear filters
					</Button>
				)}
			</div>

			{/* Results */}
			{department.courses.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-muted-foreground">
						No courses found with the current filters.
					</p>
					<Button variant="outline" onClick={clearFilters} className="mt-4">
						Clear filters
					</Button>
				</div>
			) : (
				<div className="space-y-8">
					{/* Bachelor Courses */}
					{(!filters.type || filters.type === "BACHELOR") &&
						bachelorCourses.length > 0 && (
							<div>
								<h2 className="mb-4 text-2xl font-semibold">Bachelor Courses</h2>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
									{bachelorCourses.map(course => (
										<Link
											key={course.id}
											href={`/browse/${department.code}/${course.code}`}
											className="group rounded-lg border p-4 transition-colors hover:border-primary"
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h3 className="font-semibold group-hover:text-primary">
														{course.name}
													</h3>
													<p className="text-sm text-muted-foreground">{course.code}</p>
													{course.description && (
														<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
															{course.description}
														</p>
													)}
												</div>
											</div>
											<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
												<span>{course._count.classes} classes</span>
												<span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
													{course.courseType}
												</span>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}

					{/* Master Courses */}
					{(!filters.type || filters.type === "MASTER") && masterCourses.length > 0 && (
						<div>
							<h2 className="mb-4 text-2xl font-semibold">Master Courses</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{masterCourses.map(course => (
									<Link
										key={course.id}
										href={`/browse/${department.code}/${course.code}`}
										className="group rounded-lg border p-4 transition-colors hover:border-primary"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h3 className="font-semibold group-hover:text-primary">
													{course.name}
												</h3>
												<p className="text-sm text-muted-foreground">{course.code}</p>
												{course.description && (
													<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
														{course.description}
													</p>
												)}
											</div>
										</div>
										<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
											<span>{course._count.classes} classes</span>
											<span className="rounded bg-purple-100 px-2 py-1 text-purple-800">
												{course.courseType}
											</span>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
