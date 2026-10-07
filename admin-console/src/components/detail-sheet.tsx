import type { ReactNode } from "react";

import * as Dialog from "@radix-ui/react-dialog";

import { CloseGlyph } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

/** A record opened from a table, over the page instead of on a page of its own. */
export function DetailSheet({
	open,
	onOpenChange,
	title,
	description,
	footer,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	footer?: ReactNode;
	children: ReactNode;
}) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="bg-background/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
				<Dialog.Content
					{...(!description && { "aria-describedby": undefined })}
					className="bg-popover text-popover-foreground border-border/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-2 right-2 z-50 flex w-[calc(100%-1rem)] max-w-md flex-col rounded-2xl border shadow-lg duration-300 outline-none"
				>
					<div className="border-b px-5 pt-5 pr-12 pb-4">
						<Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
						{description && (
							<Dialog.Description className="text-muted-foreground mt-0.5 text-sm">
								{description}
							</Dialog.Description>
						)}
					</div>
					<Dialog.Close
						aria-label="Chiudi"
						className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none"
					>
						<CloseGlyph className="size-4" />
					</Dialog.Close>

					<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
						{children}
					</div>

					{footer && (
						<div className="flex justify-end gap-2 border-t px-5 py-3">{footer}</div>
					)}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export function DetailSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="space-y-2">
			<h3 className="text-muted-foreground text-xs font-medium">{title}</h3>
			{children}
		</section>
	);
}

/** Label and value pairs, one per line. */
export function DetailList({ rows }: { rows: [label: string, value: ReactNode][] }) {
	return (
		<dl className="divide-y rounded-xl border text-sm">
			{rows.map(([label, value]) => (
				<div key={label} className="flex items-center justify-between gap-4 px-3 py-2">
					<dt className="text-muted-foreground shrink-0">{label}</dt>
					<dd className="min-w-0 truncate text-right">{value ?? "—"}</dd>
				</div>
			))}
		</dl>
	);
}

export function DetailSkeleton() {
	return (
		<div className="space-y-3">
			<Skeleton className="h-4 w-24" />
			<Skeleton className="h-32 w-full rounded-xl" />
			<Skeleton className="h-4 w-24" />
			<Skeleton className="h-24 w-full rounded-xl" />
		</div>
	);
}
