import { Skeleton } from "@/components/ui/skeleton";

import {
	SkeletonHero,
	SkeletonRoot,
	SkeletonStatBlock,
	SkeletonTable,
} from "./primitives";

function UserBreadcrumbSkeleton() {
	return (
		<div className="border-border bg-background inline-flex items-center gap-2 rounded-xl border px-3 py-1.5">
			<Skeleton className="size-4" />
			<Skeleton className="size-3 rounded-full" />
			<Skeleton className="h-4 w-24" />
		</div>
	);
}

export function UserDashboardSkeleton() {
	return (
		<SkeletonRoot label="Caricamento dashboard…" className="space-y-8 pb-8">
			{/* Custom hero with avatar */}
			<section className="relative w-full py-12 sm:py-16">
				<div className="container">
					<div className="flex flex-col gap-6 sm:flex-row sm:items-center">
						<Skeleton className="h-24 w-24 shrink-0 rounded-full" />
						<div className="flex-1 space-y-3">
							<Skeleton className="h-9 w-2/3 sm:h-11" />
							<Skeleton className="h-7 w-32 rounded-full" />
							<div className="flex flex-wrap gap-4">
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-4 w-40" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<div className="container space-y-8">
				{/* Quick actions — icon + state */}
				<div className="grid gap-4 sm:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="bg-card flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
						>
							<Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-5 w-2/3" />
								<Skeleton className="h-3.5 w-1/2" />
							</div>
						</div>
					))}
				</div>

				{/* Progress summary */}
				<div className="bg-card rounded-2xl border p-6 shadow-sm">
					<div className="mb-6 flex items-center justify-between">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-7 w-40 rounded-lg" />
					</div>
					<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-4 w-16" />
							</div>
						))}
					</div>
				</div>

				{/* Recent classes */}
				<div className="space-y-4">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-7 w-64" />
					<SkeletonTable rows={3} columns={4} />
				</div>

				{/* Activity: the last sittings, inside the inset card */}
				<div className="space-y-4">
					<div>
						<Skeleton className="h-4 w-24" />
						<Skeleton className="mt-1 h-6 w-40" />
					</div>
					<div className="bg-muted/40 border-border/60 rounded-2xl border p-1">
						<div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
							<div className="space-y-1.5">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-40" />
							</div>
							<Skeleton className="h-8 w-40 rounded-lg" />
						</div>
						<div className="bg-card border-border/50 space-y-4 rounded-xl border p-4">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-center gap-3">
									<Skeleton className="size-9 rounded-full" />
									<div className="flex-1 space-y-1.5">
										<Skeleton className="h-4 w-2/3" />
										<Skeleton className="h-3 w-1/2" />
									</div>
									<Skeleton className="h-4 w-14" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</SkeletonRoot>
	);
}

function SkeletonCard({ height }: { height: number }) {
	return (
		<div className="bg-muted/40 border-border/60 rounded-2xl border p-1">
			<div className="bg-card border-border/50 space-y-3 rounded-xl border p-4">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="w-full" style={{ height }} />
			</div>
		</div>
	);
}

/**
 * The analytics page: no hero — a toolbar, the four headline cards, then the grid
 * of pairs. It has to match `AnalyticsView`, or the page jumps when it arrives.
 */
export function AnalyticsSkeleton() {
	return (
		<SkeletonRoot
			label="Caricamento analytics…"
			className="container space-y-4 py-6 pb-10"
		>
			<div className="border-border/60 space-y-3 border-b pb-4">
				<Skeleton className="h-9 w-56 rounded-xl" />
				<div className="flex flex-wrap items-start justify-between gap-3">
					<Skeleton className="h-8 w-40" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-36 rounded-lg" />
						<Skeleton className="h-8 w-32 rounded-lg" />
						<Skeleton className="h-8 w-24 rounded-lg" />
						<Skeleton className="h-8 w-24 rounded-lg" />
					</div>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="bg-muted/40 border-border/60 rounded-2xl border p-1">
						<div className="bg-card border-border/50 space-y-2.5 rounded-xl border p-4">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-7 w-20" />
							<Skeleton className="h-3 w-full" />
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
				<div className="lg:col-span-8">
					<SkeletonCard height={340} />
				</div>
				<div className="lg:col-span-4">
					<SkeletonCard height={340} />
				</div>
				<div className="lg:col-span-8">
					<SkeletonCard height={200} />
				</div>
				<div className="lg:col-span-4">
					<SkeletonCard height={200} />
				</div>
				<div className="lg:col-span-4">
					<SkeletonCard height={280} />
				</div>
				<div className="lg:col-span-8">
					<SkeletonCard height={280} />
				</div>
				<div className="lg:col-span-12">
					<SkeletonCard height={180} />
				</div>
				<div className="lg:col-span-12">
					<SkeletonCard height={160} />
				</div>
			</div>
		</SkeletonRoot>
	);
}

/** No breadcrumb and no rollup, unlike `AnalyticsSkeleton` — the detail pages have neither. */
export function EntityProgressSkeleton() {
	return (
		<SkeletonRoot
			label="Caricamento progressi…"
			className="container space-y-4 py-6 pb-10"
		>
			<div className="border-border/60 space-y-3 border-b pb-4">
				<Skeleton className="h-9 w-72 rounded-xl" />
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-2">
						<Skeleton className="h-8 w-56" />
						<Skeleton className="h-4 w-40" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-36 rounded-lg" />
						<Skeleton className="h-8 w-32 rounded-lg" />
					</div>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="bg-muted/40 border-border/60 rounded-2xl border p-1">
						<div className="bg-card border-border/50 space-y-2.5 rounded-xl border p-4">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-7 w-20" />
							<Skeleton className="h-3 w-full" />
						</div>
					</div>
				))}
			</div>

			{/* Same rows as the full page, less the tree and the section scatter. */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
				<div className="lg:col-span-8">
					<SkeletonCard height={340} />
				</div>
				<div className="lg:col-span-4">
					<SkeletonCard height={340} />
				</div>
				<div className="lg:col-span-8">
					<SkeletonCard height={200} />
				</div>
				<div className="lg:col-span-4">
					<SkeletonCard height={200} />
				</div>
				<div className="lg:col-span-12">
					<SkeletonCard height={260} />
				</div>
				<div className="lg:col-span-12">
					<SkeletonCard height={160} />
				</div>
			</div>
		</SkeletonRoot>
	);
}

export function AttemptHistorySkeleton() {
	return (
		<SkeletonRoot
			label="Caricamento cronologia…"
			className="container space-y-4 py-6 pb-10"
		>
			<div className="border-border/60 space-y-3 border-b pb-4">
				<Skeleton className="h-9 w-64 rounded-xl" />
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-2">
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-32" />
					</div>
					<Skeleton className="h-8 w-28 rounded-lg" />
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="bg-muted/40 border-border/60 rounded-2xl border p-1">
						<div className="bg-card border-border/50 space-y-2.5 rounded-xl border p-4">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-7 w-20" />
							<Skeleton className="h-3 w-full" />
						</div>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 flex-wrap items-center gap-2">
					<Skeleton className="h-9 w-full rounded-xl sm:w-64" />
					<Skeleton className="h-8 w-44 rounded-lg" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-9 w-9 rounded-xl" />
					<Skeleton className="h-9 w-28 rounded-xl" />
				</div>
			</div>

			<SkeletonTable rows={10} columns={6} />
		</SkeletonRoot>
	);
}

export function BookmarksSkeleton() {
	return (
		<SkeletonRoot label="Caricamento segnalibri…" className="space-y-8 pb-8">
			<SkeletonHero withStats={1} />

			<div className="container space-y-6">
				<UserBreadcrumbSkeleton />

				<div className="space-y-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="bg-card overflow-hidden rounded-2xl border">
							<div className="flex items-center justify-between gap-3 p-4">
								<Skeleton className="h-4 w-2/3" />
								<div className="flex shrink-0 items-center gap-2">
									<Skeleton className="h-6 w-16 rounded-full" />
									<Skeleton className="h-6 w-20 rounded-full" />
									<Skeleton className="h-4 w-4 rounded-full" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</SkeletonRoot>
	);
}

export function UserClassesSkeleton() {
	return (
		<SkeletonRoot label="Caricamento insegnamenti…" className="space-y-8 pb-8">
			<SkeletonHero withStats={2} />

			<div className="container space-y-6">
				<UserBreadcrumbSkeleton />

				{/* Data table toolbar: search, then the inline filter add + column visibility */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-1 flex-wrap items-center gap-2">
						<Skeleton className="h-9 w-full rounded-xl sm:w-64" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-9 rounded-xl" />
						<Skeleton className="h-9 w-28 rounded-xl" />
					</div>
				</div>

				<SkeletonTable rows={6} columns={6} />
			</div>
		</SkeletonRoot>
	);
}

export function NotificationsSkeleton() {
	return (
		<SkeletonRoot label="Caricamento notifiche…" className="space-y-8 pb-8">
			<SkeletonHero />

			<div className="container">
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="bg-card flex items-start gap-3 rounded-2xl border p-4"
						>
							<Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-3.5 w-full max-w-md" />
								<Skeleton className="h-3 w-24" />
							</div>
							<Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
						</div>
					))}
				</div>
			</div>
		</SkeletonRoot>
	);
}

export function UserRequestsSkeleton() {
	return (
		<SkeletonRoot label="Caricamento contributi…" className="space-y-8 pb-8">
			<SkeletonHero />

			<div className="container space-y-4">
				<Skeleton className="h-12 w-full rounded-2xl" />

				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-9 w-40 rounded-xl" />
				</div>

				<div className="bg-card divide-y overflow-hidden rounded-2xl border">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 px-5 py-4">
							<Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<div className="flex shrink-0 items-center gap-3">
								<Skeleton className="h-3 w-8" />
								<Skeleton className="h-6 w-20 rounded-full" />
								<Skeleton className="h-4 w-4 rounded-full" />
							</div>
						</div>
					))}
				</div>
			</div>
		</SkeletonRoot>
	);
}

export function SettingsSkeleton() {
	return (
		<SkeletonRoot label="Caricamento impostazioni…" className="space-y-8 pb-8">
			<SkeletonHero />

			<div className="container space-y-6">
				<UserBreadcrumbSkeleton />

				{/* Profile form */}
				<div className="bg-card rounded-3xl border p-6 sm:p-8">
					<Skeleton className="mb-2 h-6 w-1/3" />
					<Skeleton className="mb-6 h-4 w-1/2" />

					<div className="mb-6 flex items-center gap-4">
						<Skeleton className="h-24 w-24 shrink-0 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-7 w-28 rounded-full" />
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full rounded-xl" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-10 w-full rounded-xl" />
						</div>
					</div>

					<div className="mt-4 space-y-2">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-10 w-full rounded-xl" />
					</div>

					<Skeleton className="mt-6 h-10 w-36 rounded-xl" />
				</div>

				{/* Stats */}
				<div>
					<Skeleton className="mb-1 h-6 w-48" />
					<Skeleton className="mb-4 h-4 w-2/3" />
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<SkeletonStatBlock key={i} />
						))}
					</div>
				</div>

				{/* Account details */}
				<div className="bg-card rounded-3xl border p-6 sm:p-8">
					<Skeleton className="mb-2 h-6 w-40" />
					<Skeleton className="mb-6 h-4 w-1/2" />
					<div className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-full rounded-xl" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-4 rounded-full" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
				</div>
			</div>
		</SkeletonRoot>
	);
}
