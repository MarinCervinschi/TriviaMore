/**
 * The contrast gate. A pair needing less than 4.5:1 is added with the floor it does need and a
 * reason; a row is never deleted to make this pass.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Hsl = { h: number; s: number; l: number };

function parseTokens(block: string): Record<string, Hsl> {
	const out: Record<string, Hsl> = {};
	const re = /--([a-z0-9-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*;/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(block))) {
		out[m[1]] = { h: Number(m[2]), s: Number(m[3]) / 100, l: Number(m[4]) / 100 };
	}
	return out;
}

function relativeLuminance({ h, s, l }: Hsl): number {
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const hp = h / 60;
	const x = c * (1 - Math.abs((hp % 2) - 1));
	const [r, g, b] =
		hp < 1
			? [c, x, 0]
			: hp < 2
				? [x, c, 0]
				: hp < 3
					? [0, c, x]
					: hp < 4
						? [0, x, c]
						: hp < 5
							? [x, 0, c]
							: [c, 0, x];
	const min = l - c / 2;
	const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
	return 0.2126 * lin(r + min) + 0.7152 * lin(g + min) + 0.0722 * lin(b + min);
}

function ratio(a: Hsl, b: Hsl): number {
	const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Every pair the app renders. `bg-muted` is included because it is the harshest surface in light. */
const PAIRS: [fg: string, bg: string, floor: number, what: string][] = [
	["foreground", "background", 4.5, "body text"],
	["muted-foreground", "background", 4.5, "secondary text on the page"],
	["muted-foreground", "card", 4.5, "secondary text on a card"],
	[
		"muted-foreground",
		"muted",
		4.5,
		"secondary text on muted — TabsList, admin sidebar",
	],
	["brand", "background", 4.5, "text-brand on the page"],
	["brand", "card", 4.5, "text-brand on a card"],
	["brand", "muted", 4.5, "text-brand on muted"],
	["danger", "background", 4.5, "text-danger on the page"],
	["danger", "muted", 4.5, "text-danger on muted"],
	["success", "background", 4.5, "text-success"],
	["success", "muted", 4.5, "text-success on muted"],
	["warning", "background", 4.5, "text-warning"],
	["warning", "muted", 4.5, "text-warning on muted"],
	["info", "background", 4.5, "text-info"],
	["info", "muted", 4.5, "text-info on muted"],
	// Against the real foreground token, not white: that difference once hid a failing 4.33.
	["primary-foreground", "primary", 4.5, "the primary button's label"],
	["destructive-foreground", "destructive", 4.5, "the destructive button's label"],
	["success-foreground", "success", 4.5, "a success fill's label"],
	["warning-foreground", "warning", 4.5, "a warning fill's label"],
	// `muted` only: it is the binding surface, and every slot clears the page and a card by more.
	["chart-1-ink", "muted", 4.5, "a category pill's label"],
	["chart-2-ink", "muted", 4.5, "a category pill's label"],
	["chart-3-ink", "muted", 4.5, "a category pill's label"],
	["chart-4-ink", "muted", 4.5, "a category pill's label"],
	["chart-5-ink", "muted", 4.5, "a category pill's label"],
	// The rollup's level icons: a graphic, so 1.4.11's 3:1, and the fill rather than
	// the ink — which is why these are the fills' only gated rows.
	["chart-2", "muted", 3, "a level icon in the progress rollup"],
	["chart-4", "muted", 3, "a level icon in the progress rollup"],
	["chart-5", "muted", 3, "a level icon in the progress rollup"],
	["foreground", "popover", 4.5, "a dropdown item"],
	["muted-foreground", "popover", 4.5, "a dropdown's secondary text"],
	// A lower bar for UI components and focus indicators (1.4.11).
	["ring", "background", 3, "the focus ring against the page"],
	["border", "background", 1.2, "a card border — visible, not readable"],
	["border", "card", 1.2, "a card's own border"],
];

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");
const rootAt = css.indexOf(":root {");
const darkAt = css.indexOf(".dark {");
// The closing brace at the start of a line, so this does not hinge on a comment staying put.
const darkEnd = css.indexOf("\n}", darkAt);

const themes = {
	light: css.slice(rootAt, darkAt),
	dark: css.slice(darkAt, darkEnd),
};

describe("colour tokens clear WCAG 2.2 AA", () => {
	it("finds both theme blocks in globals.css", () => {
		expect(rootAt, ":root block").toBeGreaterThan(-1);
		expect(darkAt, ".dark block").toBeGreaterThan(-1);
		expect(darkEnd, "the end of the .dark block").toBeGreaterThan(darkAt);
	});

	for (const [theme, block] of Object.entries(themes)) {
		describe(theme, () => {
			const tokens = parseTokens(block);

			it.each(PAIRS)("%s on %s clears %s:1 — %s", (fg, bg, floor) => {
				expect(tokens[fg], `--${fg} is missing — was it renamed?`).toBeDefined();
				expect(tokens[bg], `--${bg} is missing — was it renamed?`).toBeDefined();
				expect(ratio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(floor);
			});
		});
	}
});
