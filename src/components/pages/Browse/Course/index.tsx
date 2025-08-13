"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { CourseBreadcrumb } from "./CourseBreadcrumb";
import { CourseClasses } from "./CourseClasses";
import { CourseFilters } from "./CourseFilters";
import { CourseHeader } from "./CourseHeader";

interface Department {
	id: string;
	name: string;
	code: string;
}

interface Class {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseId: string;
	classYear: number;
	position: number;
	_count: {
		sections: number;
	};
}

interface Course {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseType: "BACHELOR" | "MASTER";
	position: number;
	departmentId: string;
	department: Department;
	_count: {
		classes: number;
	};
	classes: Class[];
}

interface CourseFilters {
	year?: string;
	search?: string;
}

interface CoursePageComponentProps {
	course: Course;
	filters: CourseFilters;
	departmentCode: string;
}

export default function CoursePageComponent({
	course,
	filters: initialFilters,
	departmentCode,
}: CoursePageComponentProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [filters, setFilters] = useState<CourseFilters>(initialFilters);
	const [searchValue, setSearchValue] = useState(initialFilters.search || "");

	const updateFilters = (newFilters: Partial<CourseFilters>) => {
		const params = new URLSearchParams(searchParams);

		Object.entries(newFilters).forEach(([key, value]) => {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		});

		router.push(
			`/browse/${departmentCode}/${course.code.toLowerCase()}?${params.toString()}`
		);
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
		router.push(`/browse/${departmentCode}/${course.code.toLowerCase()}`);
	};

	const handleFilterChange = (newFilters: Partial<CourseFilters>) => {
		const updatedFilters = { ...filters, ...newFilters };
		setFilters(updatedFilters);
		updateFilters(updatedFilters);
	};

	const filteredClasses = course.classes.filter(cls => {
		const matchesYear = !filters.year || cls.classYear.toString() === filters.year;
		const matchesSearch =
			!filters.search ||
			cls.name.toLowerCase().includes(filters.search.toLowerCase()) ||
			cls.code.toLowerCase().includes(filters.search.toLowerCase());
		return matchesYear && matchesSearch;
	});

	const hasActiveFilters = Boolean(filters.year || filters.search);

	const availableYears = Array.from(
		new Set(course.classes.map(cls => cls.classYear))
	).sort((a, b) => a - b);

	return (
		<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-8">
				<CourseBreadcrumb
					departmentName={course.department.name}
					departmentCode={departmentCode}
					courseName={course.name}
				/>

				<CourseHeader course={course} />

				<CourseFilters
					filters={filters}
					searchValue={searchValue}
					availableYears={availableYears}
					onSearchValueChange={setSearchValue}
					onSearch={handleSearch}
					onFilterChange={handleFilterChange}
					onClearFilters={clearFilters}
				/>

				<CourseClasses
					classes={filteredClasses}
					departmentCode={departmentCode}
					courseCode={course.code.toLowerCase()}
					filters={filters}
					hasActiveFilters={hasActiveFilters}
					onClearFilters={clearFilters}
				/>
			</div>
		</div>
	);
}
