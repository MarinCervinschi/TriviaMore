import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { ENVIRONMENT_TARGET } from "~/lib/environment";
import type { NavSection } from "~/lib/nav";

/** The pages of one section, grouped, beside the content. */
export function SectionSidebar({
	section,
	pathname,
	onNavigate,
	showNote = true,
}: {
	section: NavSection;
	pathname: string;
	/** Called after a link is followed, so a sheet holding the sidebar can close. */
	onNavigate?: () => void;
	showNote?: boolean;
}) {
	return (
		<div className={showNote ? "flex h-full flex-col" : undefined}>
			<nav
				aria-label={section.label}
				className="flex-1 space-y-5 overflow-y-auto px-2 py-4"
			>
				{section.groups.map(group => (
					<div key={group.label}>
						<p className="text-muted-foreground text-2xs mb-1.5 px-2.5 font-semibold tracking-[0.1em] uppercase">
							{group.label}
						</p>
						<ul className="space-y-0.5">
							{group.items.map(item => {
								const current = item.to === pathname;
								return (
									<li key={item.to}>
										<Link
											to={item.to}
											onClick={onNavigate}
											aria-current={current ? "page" : undefined}
											data-active={current}
											className={cn(
												"focus-visible:ring-ring flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none",
												"text-muted-foreground hover:bg-muted hover:text-foreground",
												"data-[active=true]:bg-muted data-[active=true]:text-foreground data-[active=true]:font-medium"
											)}
										>
											<item.icon className="size-4 shrink-0" />
											<span className="min-w-0 flex-1 truncate">{item.label}</span>
											{item.badge && (
												<span className="bg-background text-muted-foreground text-2xs rounded-md border px-1.5 py-0.5 leading-none">
													{item.badge}
												</span>
											)}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>

			{showNote && (
				<div className="p-2">
					<div className="bg-muted/50 rounded-xl border p-3">
						<p className="flex items-center gap-1.5 text-xs font-medium">
							<InfoCircleIcon className="text-info size-4" />
							Ambiente
						</p>
						<p className="text-muted-foreground mt-1 text-xs">
							{`La console lavora ${ENVIRONMENT_TARGET}. Prima di applicare un job, lancia una simulazione.`}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
