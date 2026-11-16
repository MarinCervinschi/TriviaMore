---
name: seo
description: The rules that keep TriviaMore's public pages in Google's index - seoHead on every route, canonical URLs that answer 200, the sitemap, robots.txt, redirects - and the curl checks to run before a PR. Use whenever adding or changing a public route, its head, a path or a slug, src/lib/seo.ts, src/lib/json-ld.ts, the sitemap, robots.txt or a redirect, and before opening a PR that touches any of them.
---

# SEO

The catalogue under `/browse` is most of the traffic Google sends. Its pages leave the index
quietly: nothing breaks for a user, and Search Console shows the damage weeks later. Until 3.8.2
every browse page declared a canonical ending in `/`, that URL redirected back to the page, and the
indexed pages fell from about 3,100 to 1,900 before anyone noticed (#238). The rules below exist so that does
not happen again.

## The rules

1. **Every route's `head` goes through `seoHead()`** from `src/lib/seo.ts`. A public page passes
   `title`, `description` and `path`; a private page (`/admin`, `/user`, quiz, flashcard, auth)
   passes `noindex: true` and no `path`.
2. **Every absolute URL goes through `siteUrl()`** from `src/lib/json-ld.ts`: canonical, `og:url`,
   JSON-LD, sitemap entries. Never `${SITE_URL}${path}` by hand. `siteUrl()` strips the trailing slash
   that index routes carry in `match.pathname`.
3. **A canonical points at a URL that answers 200 and whose own canonical is itself.** A canonical
   that redirects, or that lands on a 404, takes the page out of the index.
4. **One page, one URL.** Lowercase codes, no trailing slash, no query string in the canonical. The
   router answers a trailing slash with a 307 to the bare path; that is the redirect, so the canonical
   must be the bare path.
5. **The sitemap lists only canonical URLs**, the same strings the pages declare. A URL in the sitemap
   that redirects or carries a different canonical wastes crawl budget and shows up as an error.
6. **Changing a path or a slug is a redirect, not a rename.** A URL Google already indexed answers
   301 to its new home, or it becomes a 404 in Search Console.
7. **Private paths stay out twice**: `noindex` in the head and a `Disallow` in `public/robots.txt`.
   A new private area needs both.

## Before a PR

Run these against the dev server (`pnpm dev`), and against production after the deploy. Take one URL
per level from the sitemap: department, course, class, section.

```bash
U=http://localhost:3000/browse/<department>/<course>/<class>
curl -s -o /dev/null -w '%{http_code}\n' "$U"                        # 200
curl -s "$U" | grep -o '<link rel="canonical"[^>]*>'                 # same as $U, no trailing slash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$U/"       # 307 to $U
curl -s http://localhost:3000/sitemap.xml | grep -c '<loc>'          # same order of magnitude as before
```

A change to the sitemap also samples its URLs: every one should answer 200 with a canonical equal to
itself. Decode `&amp;` before requesting a URL taken from the XML.

## Reading Search Console

The Page indexing report lags by days. After a fix, open each affected reason and press
**Validate fix**; recovery takes weeks.

| Reason | What it usually means here |
|---|---|
| Page with redirect | a canonical, a link or a sitemap entry points at a URL that redirects |
| Alternative page with proper canonical tag | the page names another URL as canonical; harmless for query strings, a bug for the bare path |
| Not found (404) | a renamed path or slug without a redirect |
| Crawled, currently not indexed | Google judged the page thin or a duplicate |

## Known open points

- A section is listed under every course its class belongs to, and each copy names itself as
  canonical. Google sees duplicates and picks one.
- Every sitemap entry has today's date as `lastmod`, so Google ignores the field.
