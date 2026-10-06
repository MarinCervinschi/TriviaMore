import type { ComponentType } from "react";

import { BookIcon } from "@solar-icons/react/bold/book";
import { ClipboardCheckIcon } from "@solar-icons/react/bold/clipboard-check";
import { FlagIcon } from "@solar-icons/react/bold/flag";
import { KeyIcon } from "@solar-icons/react/bold/key";
import { LibraryIcon } from "@solar-icons/react/bold/library";
import { NotebookIcon } from "@solar-icons/react/bold/notebook";
import { TargetIcon } from "@solar-icons/react/bold/target";
import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { SquareArrowRightUpIcon } from "@solar-icons/react/linear/square-arrow-right-up";

import { Card } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconTile } from "@/components/ui/icon-tile";
import type { ClassSyllabus as Syllabus } from "@/lib/browse/types";
import { formatAcademicYear } from "@/lib/catalog/academic-year";

type Field = {
	key: Exclude<keyof Syllabus, "academicYear" | "catalogueUrl">;
	label: string;
	icon: ComponentType<{ className?: string }>;
};

const FIELDS: Field[] = [
	{ key: "objectives", label: "Obiettivi formativi", icon: FlagIcon },
	{ key: "prerequisites", label: "Prerequisiti", icon: KeyIcon },
	{ key: "contents", label: "Contenuti", icon: BookIcon },
	{ key: "teachingMethods", label: "Metodi didattici", icon: NotebookIcon },
	{ key: "assessment", label: "Verifica dell'apprendimento", icon: ClipboardCheckIcon },
	{ key: "readings", label: "Testi di riferimento", icon: LibraryIcon },
	{ key: "outcomes", label: "Risultati attesi", icon: TargetIcon },
];

/** A class's official syllabus, one block per published field; the objectives start open. */
export function ClassSyllabus({ syllabus }: { syllabus: Syllabus }) {
	const fields = FIELDS.filter(field => syllabus[field.key]);

	return (
		<section>
			<div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<p className="text-muted-foreground text-sm">
					Dal catalogo UniMore, anno accademico{" "}
					{formatAcademicYear(syllabus.academicYear)}.
				</p>
				{syllabus.catalogueUrl && (
					<a
						href={syllabus.catalogueUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground hover:text-brand inline-flex items-center gap-1 text-sm transition-colors motion-reduce:transition-none"
					>
						<SquareArrowRightUpIcon className="size-4" />
						Apri nel catalogo
					</a>
				)}
			</div>

			<div className="space-y-2.5">
				{fields.map(({ key, label, icon: Icon }, index) => (
					<Collapsible key={key} defaultOpen={index === 0} className="group">
						<Card className="overflow-hidden">
							<CollapsibleTrigger className="hover:bg-muted/40 focus-visible:ring-ring flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none">
								<IconTile size="sm" variant="frame" className="text-muted-foreground">
									<Icon />
								</IconTile>
								<span className="min-w-0 flex-1 text-sm font-semibold">{label}</span>
								<AltArrowDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
							</CollapsibleTrigger>
							<CollapsibleContent>
								<p className="text-foreground/90 pr-4 pb-4 pl-15 text-sm leading-relaxed whitespace-pre-line">
									{syllabus[key]}
								</p>
							</CollapsibleContent>
						</Card>
					</Collapsible>
				))}
			</div>
		</section>
	);
}
