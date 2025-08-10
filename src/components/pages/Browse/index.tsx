import Link from "next/link";

import { DepartmentNode } from "@/lib/types/browse.types";

export default function BrowsePageComponent({
	departments,
}: {
	departments?: DepartmentNode[];
}) {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">Browse Content</h1>
			<p className="text-muted-foreground">
				Qui puoi sfogliare tutti i contenuti disponibili per lo studio.
			</p>
			<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{departments?.map(department => (
					<Link
						key={department.id}
						href={`/browse/${department.code}`}
						className="group rounded-lg border p-6 shadow-sm transition-colors hover:border-primary"
					>
						<div className="space-y-3">
							<h2 className="text-xl font-semibold group-hover:text-primary">
								{department.name}
							</h2>
							<p className="text-sm text-muted-foreground">{department.code}</p>
							{department.description && (
								<p className="line-clamp-2 text-sm text-muted-foreground">
									{department.description}
								</p>
							)}
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>{department._count?.courses ?? 0} courses</span>
								<span className="rounded bg-gray-100 px-2 py-1">Department</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
