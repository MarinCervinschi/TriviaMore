import { PageBand } from "@/components/layout/page-band";
import { Skeleton } from "@/components/ui/skeleton";

import { SkeletonRoot } from "./primitives";

export function QuizPlaySkeleton() {
	return (
		<SkeletonRoot
			label="Caricamento quiz…"
			className="relative isolate flex h-screen flex-col"
		>
			<PageBand />
			{/* Header */}
			<div className="bg-card flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
				<div className="flex items-center gap-3">
					<Skeleton className="h-9 w-9 rounded-xl" />
					<Skeleton className="h-5 w-32" />
				</div>
				<div className="flex items-center gap-3">
					<Skeleton className="h-8 w-20 rounded-xl" />
					<Skeleton className="h-9 w-9 rounded-xl" />
				</div>
			</div>

			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar */}
				<aside className="bg-card hidden w-64 shrink-0 border-r p-4 lg:block">
					<Skeleton className="mb-4 h-4 w-32" />
					<div className="grid grid-cols-5 gap-2">
						{Array.from({ length: 20 }).map((_, i) => (
							<Skeleton key={i} className="h-9 w-9 rounded-lg" />
						))}
					</div>
				</aside>

				<div className="flex flex-1 flex-col overflow-hidden">
					{/* Progress */}
					<div className="bg-card border-b px-4 py-2 sm:px-6">
						<Skeleton className="h-2 w-full rounded-full" />
					</div>

					{/* Question card */}
					<div className="flex-1 overflow-y-auto p-6 sm:p-8">
						<div className="mx-auto max-w-3xl space-y-6">
							<div className="flex items-center gap-3">
								<Skeleton className="h-6 w-20 rounded-full" />
								<Skeleton className="h-6 w-24 rounded-full" />
							</div>
							<div className="space-y-3">
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-5/6" />
								<Skeleton className="h-6 w-3/4" />
							</div>
							<div className="space-y-3 pt-4">
								{Array.from({ length: 4 }).map((_, i) => (
									<Skeleton key={i} className="h-14 w-full rounded-2xl" />
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<div className="bg-card flex items-center justify-between border-t px-4 py-3 sm:px-6">
				<Skeleton className="h-9 w-24 rounded-xl" />
				<Skeleton className="h-9 w-32 rounded-xl" />
			</div>
		</SkeletonRoot>
	);
}

export function FlashcardSkeleton() {
	return (
		<SkeletonRoot
			label="Caricamento flashcard…"
			className="relative isolate flex h-screen flex-col"
		>
			<PageBand />
			{/* Header */}
			<div className="bg-card flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
				<div className="flex items-center gap-3">
					<Skeleton className="h-9 w-9 rounded-xl" />
					<Skeleton className="h-5 w-32" />
				</div>
				<Skeleton className="h-9 w-9 rounded-xl" />
			</div>

			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar */}
				<aside className="bg-card hidden w-64 shrink-0 border-r p-4 lg:block">
					<Skeleton className="mb-4 h-4 w-32" />
					<div className="space-y-2">
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton key={i} className="h-10 w-full rounded-lg" />
						))}
					</div>
				</aside>

				<div className="flex flex-1 flex-col overflow-hidden">
					{/* Progress */}
					<div className="bg-card border-b px-4 py-2 sm:px-6">
						<Skeleton className="h-2 w-full rounded-full" />
					</div>

					{/* Card */}
					<div className="flex flex-1 items-center justify-center p-6 sm:p-12">
						<Skeleton className="h-[420px] w-full max-w-2xl rounded-3xl" />
					</div>
				</div>
			</div>

			{/* Navigation */}
			<div className="bg-card flex items-center justify-between border-t px-4 py-3 sm:px-6">
				<Skeleton className="h-9 w-24 rounded-xl" />
				<Skeleton className="h-9 w-32 rounded-xl" />
			</div>
		</SkeletonRoot>
	);
}

export function QuizResultsSkeleton() {
	return (
		<SkeletonRoot label="Caricamento risultati…" className="container py-8">
			<div className="mx-auto max-w-4xl space-y-8">
				{/* Score hero */}
				<div className="bg-muted/40 border-border/60 rounded-2xl border p-1">
					<div className="bg-card border-border/50 overflow-hidden rounded-xl border">
						<div className="p-8 text-center sm:p-12">
							<Skeleton className="mx-auto mb-2 h-4 w-2/3 max-w-md" />
							<Skeleton className="mx-auto h-16 w-32 sm:h-20 sm:w-40" />
							<Skeleton className="mx-auto mt-3 h-5 w-48" />
							<Skeleton className="mx-auto mt-6 h-4 w-64" />
						</div>
						<div className="divide-border/60 grid grid-cols-2 divide-x border-t sm:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="flex flex-col items-center gap-1 p-4">
									<Skeleton className="size-5 rounded-full" />
									<Skeleton className="h-7 w-12" />
									<Skeleton className="h-3 w-16" />
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Answers list */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-48" />
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="bg-card rounded-2xl border p-5">
							<div className="mb-3 flex items-start justify-between gap-3">
								<Skeleton className="h-5 w-5 rounded-full" />
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-5 w-5/6" />
								<Skeleton className="h-5 w-3/4" />
							</div>
							<div className="mt-4 space-y-2">
								{Array.from({ length: 3 }).map((__, j) => (
									<Skeleton key={j} className="h-12 w-full rounded-xl" />
								))}
							</div>
						</div>
					))}
				</div>

				{/* CTA */}
				<div className="flex justify-center gap-3">
					<Skeleton className="h-11 w-40 rounded-xl" />
					<Skeleton className="h-11 w-40 rounded-xl" />
				</div>
			</div>
		</SkeletonRoot>
	);
}
