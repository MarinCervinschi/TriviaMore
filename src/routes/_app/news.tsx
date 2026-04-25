import { useEffect, useRef, type Ref } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { seoHead } from "@/lib/seo"
import { Megaphone, Newspaper, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"
import { useMarkChangelogsRead } from "@/lib/changelogs/mutations"
import { CHANGELOGS } from "@/lib/changelogs/static"
import { CATEGORY_CONFIG } from "@/lib/changelogs/types"

import type { ChangelogEntry } from "@/lib/changelogs/types"

export const Route = createFileRoute("/_app/news")({
  head: () =>
    seoHead({
      title: "Novità",
      description:
        "Scopri le ultime novità e aggiornamenti di TriviaMore.",
      path: "/news",
    }),
  component: NewsPage,
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

const DOT_COLOR: Record<ChangelogEntry["category"], string> = {
  new: "bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)]",
  improved: "bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
  fixed: "bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.15)]",
}

function NewsPage() {
  const prefersReduced = useReducedMotion()
  const { isAuthenticated } = useAuth()
  const markRead = useMarkChangelogsRead()
  const didMarkRef = useRef(false)

  // Guests can read /news but have no per-user state — skip the mutation
  // to avoid an authenticated-only server call that would always fail.
  useEffect(() => {
    if (didMarkRef.current) return
    if (!isAuthenticated) return
    if (CHANGELOGS.length === 0) return
    didMarkRef.current = true
    markRead.mutate({ versions: CHANGELOGS.map((c) => c.version) })
  }, [isAuthenticated, markRead])

  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal()
  const { ref: listRef, isVisible: listVisible } = useScrollReveal()

  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  const latest = CHANGELOGS[0]

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
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
            variants={item}
          >
            <Megaphone className="h-3.5 w-3.5" strokeWidth={2} />
            Novità e aggiornamenti
          </motion.div>
          <motion.h1
            className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
            variants={item}
          >
            Cosa c&apos;è di{" "}
            <span className="gradient-text">nuovo</span>
          </motion.h1>
          {latest && (
            <motion.p
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground"
              variants={item}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                v{latest.version}
              </span>
              <span>l&apos;ultima release è stata pubblicata il {formatDate(latest.publishedAt)}</span>
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {CHANGELOGS.length === 0 ? (
            <EmptyState
              icon={Newspaper}
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
                className="pointer-events-none absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:left-[15px]"
              />

              {CHANGELOGS.map((entry, index) => {
                const catConfig = CATEGORY_CONFIG[entry.category]
                const isLatest = index === 0

                return (
                  <motion.li
                    key={entry.version}
                    id={`v${entry.version}`}
                    className="relative pl-10 sm:pl-14 pb-12 last:pb-0"
                    variants={item}
                  >
                    {/* Dot */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-1 top-1.5 size-[14px] rounded-full ring-4 ring-background sm:left-[9px]",
                        DOT_COLOR[entry.category],
                      )}
                    />
                    {isLatest && !prefersReduced && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute left-1 top-1.5 size-[14px] animate-ping rounded-full opacity-60 sm:left-[9px]",
                          DOT_COLOR[entry.category].split(" ")[0],
                        )}
                      />
                    )}

                    {/* Meta row */}
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="font-mono text-base font-bold tracking-tight text-foreground">
                        v{entry.version}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border text-[11px] font-semibold uppercase tracking-wider",
                          catConfig.bg,
                          catConfig.color,
                          catConfig.border,
                        )}
                      >
                        {catConfig.label}
                      </Badge>
                      <time
                        dateTime={entry.publishedAt}
                        className="text-xs text-muted-foreground"
                      >
                        {formatDate(entry.publishedAt)}
                      </time>
                      {isLatest && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Ultima
                        </span>
                      )}
                    </div>

                    {/* Card */}
                    <article
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-300",
                        "hover:border-primary/30 hover:bg-card hover:shadow-lg",
                      )}
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                      <div className="p-5 sm:p-7">
                        <h2 className="mb-3 text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                          {entry.title}
                        </h2>
                        <MarkdownRenderer content={entry.body} />
                      </div>
                    </article>
                  </motion.li>
                )
              })}

              {/* Tail dot (timeline anchor) */}
              <li
                aria-hidden="true"
                className="relative pl-10 sm:pl-14"
              >
                <span className="absolute left-[5px] top-0 size-[6px] rounded-full bg-border sm:left-[13px]" />
              </li>
            </motion.ol>
          )}
        </div>
      </section>
    </div>
  )
}
