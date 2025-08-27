import SectionCardSkeleton from "../Section/SectionCardSkeleton";
import SectionCard from "./SectionCard";

interface Section {
	id: string;
	name: string;
	description?: string | null;
	isPublic: boolean;
	position: number;
	classId: string;
	_count: {
		questions: number;
	};
}

interface ClassSectionsProps {
	sections: Section[];
	departmentCode: string;
	courseCode: string;
	classCode: string;
	isLoading?: boolean;
}

const Loader = () => (
	<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{Array.from({ length: 6 }).map((_, index) => (
			<SectionCardSkeleton key={index} />
		))}
	</div>
);

export default function ClassSections({
	sections,
	departmentCode,
	courseCode,
	classCode,
	isLoading,
}: ClassSectionsProps) {
	if (isLoading) {
		return <Loader />;
	}

	if (sections.length === 0) {
		return (
			<div className="rounded-lg bg-white p-12 text-center shadow-sm dark:bg-gray-800">
				<div className="mx-auto max-w-sm">
					<div className="mb-4 text-6xl">📚</div>
					<h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						Nessuna sezione trovata
					</h3>
					<p className="text-gray-600 dark:text-gray-300">
						Non ci sono sezioni che corrispondono ai tuoi criteri di ricerca.
					</p>
				</div>
			</div>
		);
	}
	sections.sort((a, b) => a.position - b.position);

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{sections.map(section => (
				<SectionCard
					key={section.id}
					section={section}
					departmentCode={departmentCode}
					courseCode={courseCode}
					classCode={classCode}
				/>
			))}
		</div>
	);
}
