"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchDepartments() {
	try {
		const response = await fetch("/api/browse");
		if (!response.ok) {
			throw new Error("Failed to fetch departments");
		}
		return response.json();
	} catch (error) {
		console.error("Error fetching departments:", error);
		throw error;
	}
}

export default function BrowsePageComponent() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["browse-departments"],
		queryFn: fetchDepartments,
	});

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center">
					<div className="text-center">
						<div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
						<p className="mt-4 text-muted-foreground">Loading departments...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<p className="text-red-500">Error loading departments: {error.message}</p>
				</div>
			</div>
		);
	}

	const { departments = [], isUser = false } = data || {};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">Browse Content</h1>
			<p className="text-muted-foreground">
				Qui puoi sfogliare tutti i contenuti disponibili per lo studio.
			</p>
			<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{departments.map((department: any) => (
					<div key={department.id} className="rounded-lg border p-4 shadow-sm">
						<h2 className="text-xl font-semibold">{department.name}</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							{department.description}
						</p>
						<div className="mt-4">
							<h3 className="text-lg font-medium">
								Courses ({department._count?.courses ?? 0})
							</h3>
							<ul className="mt-2 list-inside list-disc space-y-1">
								{department.courses && department.courses.length > 0 ? (
									department.courses.map((course: any) => (
										<li key={course.id}>
											<span className="font-semibold">{course.name}</span>
											{course.description && (
												<span className="ml-2 text-sm text-muted-foreground">
													{course.description}
												</span>
											)}
											<span className="ml-2 text-xs text-gray-500">
												({course._count?.classes ?? 0} classes)
											</span>
										</li>
									))
								) : (
									<li className="text-sm text-gray-500">No courses available</li>
								)}
							</ul>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
