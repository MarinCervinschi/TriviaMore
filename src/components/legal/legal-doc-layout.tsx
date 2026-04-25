import { useMemo } from "react"
import type { LucideIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { LegalHero } from "@/components/legal/legal-hero"
import {
  LegalRelatedDocs,
  type LegalDocSlug,
} from "@/components/legal/legal-related-docs"
import { LegalToc, type TocItem } from "@/components/legal/legal-toc"
import { cn } from "@/lib/utils"

interface LegalDocLayoutProps {
  markdown: string
  meta: {
    title: string
    description: string
    icon: LucideIcon
    version: string
    lastUpdated: string
    slug: LegalDocSlug
  }
}

const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/g
const HEADING_STRIP_REGEX = /^#\s+.+$/m
const META_STRIP_REGEX = /^\*\*(Versione|Ultimo aggiornamento):\*\*.*$/gm
const H2_LINE_REGEX = /^##\s+(.+)$/gm

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function extractTocItems(markdown: string): TocItem[] {
  const items: TocItem[] = []
  const matches = markdown.matchAll(H2_LINE_REGEX)
  for (const match of matches) {
    const text = match[1].trim()
    items.push({ id: slugify(text), text })
  }
  return items
}

function getHeadingText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(getHeadingText).join("")
  if (children && typeof children === "object" && "props" in children) {
    const el = children as { props?: { children?: React.ReactNode } }
    return getHeadingText(el.props?.children)
  }
  return ""
}

/**
 * Orchestrates the visual structure of each legal page: decorative
 * backdrop, hero with metadata, sticky table of contents on desktop,
 * typography-optimized content card, and cross-navigation footer.
 * The first h1 and the version/updated lines in the markdown source
 * are stripped because they are surfaced in the hero instead.
 */
export function LegalDocLayout({ markdown, meta }: LegalDocLayoutProps) {
  const cleanedMarkdown = useMemo(() => {
    return markdown
      .replace(HTML_COMMENT_REGEX, "")
      .replace(HEADING_STRIP_REGEX, "")
      .replace(META_STRIP_REGEX, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }, [markdown])

  const tocItems = useMemo(
    () => extractTocItems(cleanedMarkdown),
    [cleanedMarkdown],
  )

  return (
    <div className="relative">
      <div className="container max-w-6xl py-10 sm:py-14">
        <LegalHero {...meta} />

        <hr className="my-10 border-border/60" />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="min-w-0">
            <div
              className="prose prose-sm max-w-none
                prose-headings:scroll-mt-24
                prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:border-border/60
                prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-base prose-h3:font-semibold
                prose-p:leading-relaxed prose-p:text-[15px]
                prose-a:text-primary prose-a:underline-offset-2 hover:prose-a:text-primary/80
                prose-strong:text-foreground
                prose-li:marker:text-primary/70
                first:prose-p:text-base first:prose-p:text-muted-foreground first:prose-p:leading-relaxed"
            >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children, ...props }) => {
                      const text = getHeadingText(children)
                      return (
                        <h2 id={slugify(text)} {...props}>
                          {children}
                        </h2>
                      )
                    },
                    h3: ({ children, ...props }) => {
                      const text = getHeadingText(children)
                      return (
                        <h3 id={slugify(text)} {...props}>
                          {children}
                        </h3>
                      )
                    },
                    table: ({ children }) => (
                      <div className="not-prose my-6 overflow-x-auto rounded-xl border border-border/70">
                        <table className="w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="border-b border-border/70 bg-muted/40">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-border/50">
                        {children}
                      </tbody>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 align-top text-sm leading-relaxed">
                        {children}
                      </td>
                    ),
                    code: ({ children, className }) => (
                      <code
                        className={cn(
                          "rounded-md bg-muted px-1.5 py-0.5 text-[0.9em] font-medium text-foreground",
                          className,
                        )}
                      >
                        {children}
                      </code>
                    ),
                  }}
              >
                {cleanedMarkdown}
              </ReactMarkdown>
            </div>
          </article>

          <aside className="hidden lg:block">
            <LegalToc items={tocItems} />
          </aside>
        </div>

        <LegalRelatedDocs currentSlug={meta.slug} />
      </div>
    </div>
  )
}
