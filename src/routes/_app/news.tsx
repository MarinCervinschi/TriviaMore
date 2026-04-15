import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { seoHead } from "@/lib/seo"
import { Megaphone, Newspaper } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"
import { changelogQueries } from "@/lib/changelogs/queries"
import { CATEGORY_CONFIG } from "@/lib/changelogs/types"

export const Route = createFileRoute("/_app/news")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(changelogQueries.published()),
  head: () =>
    seoHead({
      title: "Novità",
      description:
        "Scopri le ultime novità e aggiornamenti di TriviaMore.",
      path: "/news",
    }),
  component: NewsPage,
})

function NewsPage() {
  const { data: changelogs } = useSuspenseQuery(changelogQueries.published())
  const prefersReduced = useReducedMotion()

  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal()
  const { ref: listRef, isVisible: listVisible } = useScrollReveal()

  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
          <div className="absolute -right-40 top-0 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
          <div className="absolute -left-40 bottom-0 h-[300px] w-[300px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
          <div className="absolute inset-0 dot-pattern" />
        </div>

        <motion.div
          ref={heroRef}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          variants={container}
          initial="hidden"
          animate={heroVisible ? "visible" : "hidden"}
        >
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              className="mb-4 inline-flex rounded-2xl bg-primary/10 p-4"
              variants={item}
            >
              <Megaphone
                className="h-8 w-8 text-primary"
                strokeWidth={1.5}
              />
            </motion.div>
            <motion.p
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary"
              variants={item}
            >
              Novità
            </motion.p>
            <motion.h1
              className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
              variants={item}
            >
              Cosa c&apos;è di{" "}
              <span className="gradient-text">nuovo</span>
            </motion.h1>
            <motion.p
              className="text-lg leading-relaxed text-muted-foreground sm:text-xl"
              variants={item}
            >
              Tutte le ultime novità, miglioramenti e correzioni di TriviaMore.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Changelog entries */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {changelogs.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="Nessuna novità ancora"
              description="Le novità e gli aggiornamenti verranno pubblicati qui."
            />
          ) : (
            <motion.div
              ref={listRef}
              className="space-y-8"
              variants={container}
              initial="hidden"
              animate={listVisible ? "visible" : "hidden"}
            >
              {changelogs.map((entry) => {
                const catConfig =
                  CATEGORY_CONFIG[
                    entry.category as keyof typeof CATEGORY_CONFIG
                  ]

                return (
                  <motion.article
                    key={entry.id}
                    id={`v${entry.version}`}
                    className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    variants={item}
                  >
                    {/* Accent gradient on hover */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative p-6 sm:p-8">
                      {/* Header: version, category, date */}
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-xl bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                          v{entry.version}
                        </span>
                        {catConfig && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full",
                              catConfig.bg,
                              catConfig.color,
                              catConfig.border,
                            )}
                          >
                            {catConfig.label}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.published_at!).toLocaleDateString(
                            "it-IT",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="mb-4 text-xl font-bold tracking-tight sm:text-2xl">
                        {entry.title}
                      </h2>

                      {/* Body (markdown) */}
                      <MarkdownRenderer content={entry.body} />
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
