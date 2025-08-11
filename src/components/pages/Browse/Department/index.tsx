"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { DepartmentBreadcrumb } from "./DepartmentBreadcrumb";
import { DepartmentCourses } from "./DepartmentCourses";
import { DepartmentFilters } from "./DepartmentFilters";
import { DepartmentHeader } from "./DepartmentHeader";

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

interface DepartmentFilters {
	type?: "BACHELOR" | "MASTER";
	search?: string;
}

interface DepartmentPageComponentProps {
	department: Department;
	filters: DepartmentFilters;
}

export default function DepartmentPageComponent({
	department,
	filters: initialFilters,
}: DepartmentPageComponentProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [filters, setFilters] = useState<DepartmentFilters>(initialFilters);
	const [searchValue, setSearchValue] = useState(initialFilters.search || "");

	const updateFilters = (newFilters: Partial<DepartmentFilters>) => {
		const params = new URLSearchParams(searchParams);

		Object.entries(newFilters).forEach(([key, value]) => {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		});

		router.push(`/browse/${department.code.toLowerCase()}?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const newFilters = { ...filters, search: searchValue || undefined };
		setFilters(newFilters);
		updateFilters(newFilters);
	};

	const clearFilters = () => {
		const newFilters = {};
		setFilters(newFilters);
		setSearchValue("");
		router.push(`/browse/${department.code.toLowerCase()}`);
	};

	const handleFilterChange = (newFilters: Partial<DepartmentFilters>) => {
		const updatedFilters = { ...filters, ...newFilters };
		setFilters(updatedFilters);
		updateFilters(updatedFilters);
	};

	const filteredCourses = department.courses.filter(course => {
		const matchesType = !filters.type || course.courseType === filters.type;
		const matchesSearch =
			!filters.search ||
			course.name.toLowerCase().includes(filters.search.toLowerCase()) ||
			course.code.toLowerCase().includes(filters.search.toLowerCase());
		return matchesType && matchesSearch;
	});

	const hasActiveFilters = Boolean(filters.type || filters.search);

	return (
		<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-8">
				<DepartmentBreadcrumb departmentName={department.name} />

				<DepartmentHeader department={department} />

				<DepartmentFilters
					filters={filters}
					searchValue={searchValue}
					onSearchValueChange={setSearchValue}
					onSearch={handleSearch}
					onFilterChange={handleFilterChange}
					onClearFilters={clearFilters}
				/>

				<DepartmentCourses
					courses={filteredCourses}
					departmentCode={department.code.toLowerCase()}
					filters={filters}
					hasActiveFilters={hasActiveFilters}
					onClearFilters={clearFilters}
				/>
			</div>
		</div>
	);
}
