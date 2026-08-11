import { Link } from "@tanstack/react-router";

import { GithubIcon } from "@/components/icons";
import { Logo } from "@/components/ui/logo";

import type { FooterSection } from "./data";

export function LandingFooter({ sections }: { sections: FooterSection[] }) {
	return (
		<footer className="relative border-t">
			{/* Subtle gradient background */}
			<div className="from-muted/40 to-muted/60 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b" />

			<div className="container py-16">
				<div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
					{/* Brand column */}
					<div className="col-span-2 md:col-span-1">
						<Link to="/" className="mb-4 inline-block">
							<Logo size="md" />
						</Link>
						<p className="text-muted-foreground mb-4 max-w-xs text-sm leading-relaxed">
							La piattaforma open source creata da studenti per studenti. Preparati agli
							esami universitari con la community.
						</p>
						<a
							href="https://github.com/MarinCervinschi/TriviaMore"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors duration-200"
						>
							<GithubIcon className="h-4 w-4" />
							GitHub
						</a>
					</div>

					{sections.map(section => (
						<div key={section.title}>
							<h4 className="text-foreground/70 eyebrow-lg mb-4">{section.title}</h4>
							<ul className="space-y-3">
								{section.links.map(link => (
									<li key={link.label}>
										{link.href.startsWith("http") ? (
											<a
												href={link.href}
												className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
												target="_blank"
												rel="noopener noreferrer"
											>
												{link.label}
											</a>
										) : (
											<Link
												to={link.href}
												className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
											>
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="text-muted-foreground/60 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs sm:flex-row">
					<p>
						&copy; {new Date().getFullYear()} TriviaMore. Progetto open source per la
						community studentesca.
					</p>
					<div className="flex flex-col items-center gap-1 sm:items-end">
						<p>Fatto con cura a Modena</p>
						<p>
							Icone{" "}
							<a
								href="https://www.figma.com/community/file/1166831539721848736"
								className="hover:text-foreground underline underline-offset-2 transition-colors"
								target="_blank"
								rel="noopener noreferrer"
							>
								Solar
							</a>{" "}
							di 480 Design,{" "}
							<a
								href="https://creativecommons.org/licenses/by/4.0/"
								className="hover:text-foreground underline underline-offset-2 transition-colors"
								target="_blank"
								rel="noopener noreferrer"
							>
								CC BY 4.0
							</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
