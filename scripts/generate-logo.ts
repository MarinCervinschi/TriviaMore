import { Resvg } from "@resvg/resvg-js"
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const LOGO_COLOR = "#bc351a"
const publicDir = resolve(import.meta.dirname, "../public")
const svgPath = resolve(publicDir, "new-logo.svg")
const baseSvg = readFileSync(svgPath, "utf-8")

function renderPng(svg: string, size: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "rgba(0,0,0,0)",
  })
  return Buffer.from(resvg.render().asPng())
}

function coloredSvg(color: string): string {
  const newStyle = `
    <style>
      .cls-1, .cls-2 {
        fill: none;
        stroke-linecap: round;
        stroke-width: 2px;
      }
      .cls-1 {
        stroke: ${color};
        stroke-linejoin: round;
      }
      .cls-2 {
        stroke: ${color};
        stroke-miterlimit: 10;
      }
      .cls-3 {
        fill: ${color};
      }
    </style>
  `
  return baseSvg.replace(/<style>[\s\S]*?<\/style>/, newStyle)
}

function whiteSvgOnBg(bgColor: string, size: number): Buffer {
  const svg = coloredSvg("#ffffff")
  // Wrap with a background rect
  const withBg = svg.replace(
    /<svg([^>]*)>/,
    `<svg$1><rect width="48" height="48" rx="8" fill="${bgColor}"/>`,
  )
  return renderPng(withBg, size)
}

// --- Generate all assets ---

const svg = coloredSvg(LOGO_COLOR)

// 1. favicon sizes (16, 32, 48) for ICO
const faviconSizes = [16, 24, 32, 48]
const faviconPngs: Buffer[] = []
for (const size of faviconSizes) {
  const png = renderPng(svg, size)
  faviconPngs.push(png)
  writeFileSync(resolve(publicDir, `favicon-${size}.png`), png)
  console.log(`Generated: favicon-${size}.png`)
}

// 2. PWA icons (transparent bg)
for (const size of [192, 512]) {
  const png = renderPng(svg, size)
  writeFileSync(resolve(publicDir, `logo${size}.png`), png)
  console.log(`Generated: logo${size}.png`)
}

// 3. Apple touch icon (180x180, white on colored bg for visibility)
const applePng = whiteSvgOnBg(LOGO_COLOR, 180)
writeFileSync(resolve(publicDir, "apple-touch-icon.png"), applePng)
console.log("Generated: apple-touch-icon.png")

// 4. OG default image (1200x630, logo centered on white bg)
const ogWidth = 1200
const ogHeight = 630
const logoSize = 280
const logoX = (ogWidth - logoSize) / 2
const logoY = (ogHeight - logoSize) / 2 - 20
const innerSvg = coloredSvg(LOGO_COLOR)
  .replace(/<\?xml[^?]*\?>/, "")
  .replace(/<svg[^>]*>/, "")
  .replace(/<\/svg>/, "")

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}">
  <rect width="${ogWidth}" height="${ogHeight}" fill="#ffffff"/>
  <g transform="translate(${logoX}, ${logoY})">
    <svg viewBox="0 0 48 48" width="${logoSize}" height="${logoSize}" fill="none">
      ${innerSvg}
    </svg>
  </g>
  <text x="${ogWidth / 2}" y="${logoY + logoSize + 55}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" fill="${LOGO_COLOR}">TriviaMore</text>
  <text x="${ogWidth / 2}" y="${logoY + logoSize + 95}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#666666">Quiz e flashcard per studiare meglio</text>
</svg>`
const ogPng = renderPng(ogSvg, ogWidth)
writeFileSync(resolve(publicDir, "og-default.png"), ogPng)
console.log("Generated: og-default.png")

// 5. SVG favicon (scalable, for modern browsers)
const faviconSvg = coloredSvg(LOGO_COLOR)
  .replace(/<\?xml[^?]*\?>/, "")
  .replace(/width="800px" height="800px"/, 'width="32" height="32"')
writeFileSync(resolve(publicDir, "favicon.svg"), faviconSvg)
console.log("Generated: favicon.svg")

console.log("\nDone! Now generate favicon.ico from the PNGs using an online tool or:")
console.log("  The 32x32 PNG has been saved as favicon-32.png")
console.log("  You can use it directly or convert to .ico")
