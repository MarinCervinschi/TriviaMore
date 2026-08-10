import { type Ref, useEffect, useRef } from "react";

import { FeedIcon } from "@solar-icons/react/linear/feed";
import { StarsIcon } from "@solar-icons/react/linear/stars";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useAuth } from "@/hooks/useAuth";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useMarkChangelogsRead } from "@/lib/changelogs/mutations";
import { CHANGELOGS } from "@/lib/changelogs/static";
import { CATEGORY_CONFIG } from "@/lib/changelogs/types";
import type { ChangelogEntry } from "@/lib/changelogs/types";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { formatDateLong } from "@/lib/utils/format";

export const Route = createFileRoute("/_app/news")({
	head: () =>
		seoHead({
			title: "Novità",
			description: "Scopri le ultime novità e aggiornamenti di TriviaMore.",
			path: "/news",
		}),
	component: NewsPage,
});

const formatDate = formatDateLong;

const DOT_COLOR: Record<ChangelogEntry["category"], string> = {
	new: "bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)]",
	improved: "bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
	fixed: "bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.15)]",
};

function NewsPage() {
	const prefersReduced = useReducedMotion();
	const { isAuthenticated } = useAuth();
	const markRead = useMarkChangelogsRead();
	const didMarkRef = useRef(false);

	// Guests can read /news but have no per-user state — skip the mutation
	// to avoid an authenticated-only server call that would always fail.
	useEffect(() => {
		if (didMarkRef.current) return;
		if (!isAuthenticated) return;
		if (CHANGELOGS.length === 0) return;
		didMarkRef.current = true;
		markRead.mutate({ versions: CHANGELOGS.map(c => c.version) });
	}, [isAuthenticated, markRead]);

	const { ref: heroRef, isVisible: heroVisible } = useScrollReveal();
	const { ref: listRef, isVisible: listVisible } = useScrollReveal();

	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	const latest = CHANGELOGS[0];

	return (
		<div className="relative">
			{/* Hero */}
			<section className="relative pt-16 pb-10 sm:pt-24 sm:pb-14">
				<motion.div
					ref={heroRef}
					className="mx-auto max-w-3xl px-4 sm:px-6"
					variants={container}
					initial="hidden"
					animate={heroVisible ? "visible" : "hidden"}
				>
					<motion.div
						className="border-primary/20 bg-primary/5 text-primary mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-widest uppercase"
						variants={item}
					>
						<FeedIcon className="h-3.5 w-3.5" />
						Novità e aggiornamenti
					</motion.div>
					<motion.h1
						className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl"
						variants={item}
					>
						Cosa c&apos;è di <span className="gradient-text">nuovo</span>
					</motion.h1>
					{latest && (
						<motion.p
							className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
							variants={item}
						>
							<span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold">
								<StarsIcon className="h-3 w-3" />v{latest.version}
							</span>
							<span>
								l&apos;ultima release è stata pubblicata il{" "}
								{formatDate(latest.publishedAt)}
							</span>
						</motion.p>
					)}
				</motion.div>
			</section>

			{/* Timeline */}
			<section className="pb-24 sm:pb-32">
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					{CHANGELOGS.length === 0 ? (
						<EmptyState
							icon={FeedIcon}
							title="Nessuna novità ancora"
							description="Le novità e gli aggiornamenti verranno pubblicati qui."
						/>
					) : (
						<motion.ol
							ref={listRef as unknown as Ref<HTMLOListElement>}
							className="relative"
							variants={container}
							initial="hidden"
							animate={listVisible ? "visible" : "hidden"}
						>
							{/* Vertical rail — gradient fades at top/bottom */}
							<div
								aria-hidden="true"
								className="via-border pointer-events-none absolute top-2 bottom-2 left-[11px] w-px bg-gradient-to-b from-transparent to-transparent sm:left-[15px]"
							/>

							{CHANGELOGS.map((entry, index) => {
								const catConfig = CATEGORY_CONFIG[entry.category];
								const isLatest = index === 0;

								return (
									<motion.li
										key={entry.version}
										id={`v${entry.version}`}
										className="relative pb-12 pl-10 last:pb-0 sm:pl-14"
										variants={item}
									>
										{/* Dot */}
										<span
											aria-hidden="true"
											className={cn(
												"ring-background absolute top-1.5 left-1 size-[14px] rounded-full ring-4 sm:left-[9px]",
												DOT_COLOR[entry.category]
											)}
										/>
										{isLatest && !prefersReduced && (
											<span
												aria-hidden="true"
												className={cn(
													"absolute top-1.5 left-1 size-[14px] animate-ping rounded-full opacity-60 sm:left-[9px]",
													DOT_COLOR[entry.category].split(" ")[0]
												)}
											/>
										)}

										{/* Meta row */}
										<div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
											<span className="text-foreground font-mono text-base font-bold tracking-tight">
												v{entry.version}
											</span>
											<Badge
												variant="outline"
												className={cn(
													"rounded-full border text-xs font-semibold tracking-wider uppercase",
													catConfig.bg,
													catConfig.color,
													catConfig.border
												)}
											>
												{catConfig.label}
											</Badge>
											<time
												dateTime={entry.publishedAt}
												className="text-muted-foreground text-xs"
											>
												{formatDate(entry.publishedAt)}
											</time>
											{isLatest && (
												<span className="bg-primary/10 text-primary text-2xs rounded-full px-2 py-0.5 font-bold tracking-wider uppercase">
													Ultima
												</span>
											)}
										</div>

										{/* Card */}
										<article
											className={cn(
												"group bg-card/50 relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300",
												"hover:border-primary/30 hover:bg-card hover:shadow-lg"
											)}
										>
											<div
												aria-hidden="true"
												className="via-primary/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
											/>
											<div className="p-5 sm:p-7">
												<h2 className="mb-3 text-xl leading-tight font-bold tracking-tight sm:text-2xl">
													{entry.title}
												</h2>
												<MarkdownRenderer content={entry.body} />
											</div>
										</article>
									</motion.li>
								);
							})}

							{/* Tail dot (timeline anchor) */}
							<li aria-hidden="true" className="relative pl-10 sm:pl-14">
								<span className="bg-border absolute top-0 left-[5px] size-[6px] rounded-full sm:left-[13px]" />
							</li>
						</motion.ol>
					)}
				</div>
			</section>
		</div>
	);
}
