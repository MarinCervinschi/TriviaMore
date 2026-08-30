import { PageBand } from "@/components/layout/page-band";
import { Skeleton } from "@/components/ui/skeleton";

import { SkeletonInset, SkeletonRoot } from "./primitives";

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
							<SkeletonInset>
								<div className="space-y-3 p-6">
									<Skeleton className="h-6 w-full" />
									<Skeleton className="h-6 w-5/6" />
									<Skeleton className="h-6 w-3/4" />
								</div>
							</SkeletonInset>
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
			<div className="mx-auto max-w-4xl space-y-6">
				{/* Toolbar */}
				<div className="flex items-center justify-between gap-4">
					<Skeleton className="h-5 w-72" />
					<Skeleton className="h-5 w-40" />
				</div>

				{/* Outcome */}
				<SkeletonInset header>
					<div className="flex flex-col sm:flex-row">
						<div className="flex-1 p-7">
							<div className="flex gap-2">
								<Skeleton className="h-5 w-24 rounded-full" />
								<Skeleton className="h-5 w-28 rounded-full" />
							</div>
							<Skeleton className="mt-5 h-14 w-32" />
							<Skeleton className="mt-3 h-6 w-24" />
						</div>
						<div className="border-border/60 space-y-2 border-t p-7 sm:w-80 sm:border-t-0 sm:border-l">
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-2.5 w-full rounded-full" />
							<Skeleton className="h-3 w-2/3" />
						</div>
					</div>
					<div className="flex gap-3 border-t px-7 py-4">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-4 w-28" />
					</div>
					<div className="divide-border/60 grid grid-cols-2 divide-x border-t sm:grid-cols-5">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex flex-col items-center gap-1 p-4">
								<Skeleton className="size-5 rounded-full" />
								<Skeleton className="h-7 w-12" />
								<Skeleton className="h-3 w-16" />
							</div>
						))}
					</div>
				</SkeletonInset>

				{/* Pace and difficulty */}
				<div className="grid gap-6 sm:grid-cols-2">
					{Array.from({ length: 2 }).map((_, i) => (
						<SkeletonInset key={i} header footer>
							<div className="space-y-4 p-5">
								<Skeleton className="h-8 w-40" />
								<Skeleton className="h-2 w-full rounded-full" />
								<Skeleton className="h-2 w-full rounded-full" />
								<Skeleton className="h-2 w-full rounded-full" />
							</div>
						</SkeletonInset>
					))}
				</div>

				{/* Trend */}
				<SkeletonInset header>
					<div className="flex flex-col sm:flex-row">
						<div className="border-border/60 space-y-3 border-b p-5 sm:w-60 sm:border-r sm:border-b-0">
							<Skeleton className="h-3 w-28" />
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-5 w-32 rounded-full" />
						</div>
						<div className="flex flex-1 items-end gap-3 p-5">
							{[60, 80, 70, 95, 104].map(height => (
								<Skeleton
									key={height}
									className="flex-1 rounded-t"
									style={{ height }}
								/>
							))}
						</div>
					</div>
				</SkeletonInset>

				{/* Review */}
				<div className="space-y-3.5">
					<div className="flex items-center justify-between gap-4">
						<Skeleton className="h-7 w-48" />
						<Skeleton className="h-9 w-72 rounded-xl" />
					</div>
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="bg-card border-border/50 flex items-center gap-3 rounded-2xl border p-3.5"
							>
								<Skeleton className="size-8 shrink-0 rounded-lg" />
								<Skeleton className="h-5 flex-1" />
								<Skeleton className="h-4 w-16 shrink-0" />
							</div>
						))}
					</div>
				</div>

				{/* CTA */}
				<div className="flex justify-center gap-3 pt-2 pb-8">
					<Skeleton className="h-11 w-40 rounded-xl" />
					<Skeleton className="h-11 w-44 rounded-xl" />
				</div>
			</div>
		</SkeletonRoot>
	);
}
