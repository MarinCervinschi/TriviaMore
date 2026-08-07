import { Link } from "@tanstack/react-router";
import { ArrowRight, Cookie, Scale, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type LegalDocSlug = "terms" | "privacy" | "cookies";

interface RelatedDoc {
	slug: LegalDocSlug;
	href: "/legal/terms" | "/legal/privacy" | "/legal/cookies";
	title: string;
	description: string;
	icon: LucideIcon;
}

const DOCS: RelatedDoc[] = [
	{
		slug: "terms",
		href: "/legal/terms",
		title: "Termini e Condizioni",
		description: "Le regole di utilizzo del Servizio.",
		icon: Scale,
	},
	{
		slug: "privacy",
		href: "/legal/privacy",
		title: "Privacy Policy",
		description: "Come trattiamo i tuoi dati personali.",
		icon: ShieldCheck,
	},
	{
		slug: "cookies",
		href: "/legal/cookies",
		title: "Cookie Policy",
		description: "I cookie che utilizziamo e come gestirli.",
		icon: Cookie,
	},
];

interface LegalRelatedDocsProps {
	currentSlug: LegalDocSlug;
}

/**
 * Cross-navigation between the three legal documents, rendered under
 * the main content. Excludes the currently-displayed document so the
 * user is always offered the other two as next steps.
 */
export function LegalRelatedDocs({ currentSlug }: LegalRelatedDocsProps) {
	const others = DOCS.filter(doc => doc.slug !== currentSlug);

	return (
		<section aria-label="Altri documenti legali" className="mt-12 space-y-4">
			<div className="flex items-end justify-between">
				<h2 className="text-lg font-semibold">Altri documenti legali</h2>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{others.map(doc => (
					<Link
						key={doc.slug}
						to={doc.href}
						className="group border-border/60 bg-card hover:border-primary/40 hover:shadow-primary/5 relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
					>
						<div className="bg-primary/5 pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-70" />
						<div className="relative flex items-start gap-4">
							<div className="border-primary/15 bg-primary/5 group-hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200">
								<doc.icon className="text-primary h-5 w-5" strokeWidth={1.5} />
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-2">
									<h3 className="truncate text-sm font-semibold">{doc.title}</h3>
									<ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
								</div>
								<p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
									{doc.description}
								</p>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
