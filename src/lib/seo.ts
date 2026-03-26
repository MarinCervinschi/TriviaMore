const SITE_NAME = "TriviaMore"
const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://triviamore.it"
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

type SeoHeadOptions = {
  title: string
  description?: string
  path?: string
  type?: "website" | "article"
  image?: string
  noindex?: boolean
}

export function seoHead({
  title,
  description,
  path,
  type = "website",
  image,
  noindex,
}: SeoHeadOptions) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = path ? `${SITE_URL}${path}` : undefined
  const ogImage = image ?? DEFAULT_OG_IMAGE

  const meta: Record<string, string>[] = [{ title: fullTitle }]

  if (description) {
    meta.push({ name: "description", content: description })
  }

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" })
  }

  if (!noindex) {
    meta.push(
      { property: "og:title", content: fullTitle },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: type },
      { property: "og:locale", content: "it_IT" },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:image", content: ogImage },
    )
    if (description) {
      meta.push(
        { property: "og:description", content: description },
        { name: "twitter:description", content: description },
      )
    }
    if (canonicalUrl) {
      meta.push({ property: "og:url", content: canonicalUrl })
    }
  }

  const links: Record<string, string>[] = []
  if (canonicalUrl && !noindex) {
    links.push({ rel: "canonical", href: canonicalUrl })
  }

  return { meta, links }
}
