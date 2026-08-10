import { useRef, useState } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "../theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { useNavItems } from "./nav-links";
import type { NavItem } from "./nav-links";
import { AuthSection } from "./user-menu";

function NavLogo() {
	return (
		<Link to="/" className="transition-transform hover:scale-105">
			<Logo size="md" />
		</Link>
	);
}

function DesktopNavLink({ item }: { item: Extract<NavItem, { type: "link" }> }) {
	return (
		<Link
			to={item.to}
			className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
			activeProps={{
				className: "bg-primary/10 text-primary font-semibold hover:text-primary",
			}}
		>
			{item.label}
		</Link>
	);
}

// Hover dropdown with a clickable main link
function DesktopNavDropdown({
	item,
}: {
	item: Extract<NavItem, { type: "dropdown" }>;
}) {
	const [open, setOpen] = useState(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	function handleEnter() {
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
		setOpen(true);
	}

	function handleLeave() {
		closeTimer.current = setTimeout(() => setOpen(false), 150);
	}

	return (
		<div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
			{/* Trigger — clickable link + chevron */}
			{item.to ? (
				<Link
					to={item.to}
					className={cn(
						"text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
						open && "text-foreground"
					)}
					activeProps={{
						className: "bg-primary/10 text-primary font-semibold hover:text-primary",
					}}
				>
					{item.label}
					<AltArrowDownIcon
						className={cn(
							"h-3.5 w-3.5 transition-transform duration-200",
							open && "rotate-180"
						)}
					/>
				</Link>
			) : (
				<button
					className={cn(
						"text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none",
						open && "text-foreground"
					)}
				>
					{item.label}
					<AltArrowDownIcon
						className={cn(
							"h-3.5 w-3.5 transition-transform duration-200",
							open && "rotate-180"
						)}
					/>
				</button>
			)}

			{/* Dropdown panel */}
			{open && (
				<div className="absolute top-full left-0 z-50 pt-2">
					<div className="bg-popover animate-in fade-in-0 zoom-in-95 min-w-[240px] overflow-hidden rounded-xl border p-1.5 shadow-lg duration-150">
						{item.children.map(child => (
							<Link
								key={child.to}
								to={child.to}
								onClick={() => setOpen(false)}
								className="hover:bg-accent flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors"
							>
								{child.icon && (
									<div className="bg-primary/10 mt-0.5 flex-shrink-0 rounded-lg p-1.5">
										<child.icon className="text-primary h-4 w-4" />
									</div>
								)}
								<div className="min-w-0">
									<p className="text-sm font-medium">{child.label}</p>
									{child.description && (
										<p className="text-muted-foreground mt-0.5 text-xs">
											{child.description}
										</p>
									)}
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function DesktopNavItem({ item }: { item: NavItem }) {
	if (item.type === "link") return <DesktopNavLink item={item} />;
	return <DesktopNavDropdown item={item} />;
}

export function Navbar() {
	const navItems = useNavItems();

	return (
		<header className="border-border/50 bg-background/70 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
			<div className="container flex h-16 items-center">
				<NavLogo />

				{/* Desktop nav */}
				<nav className="ml-8 hidden md:flex md:gap-1">
					{navItems.map((item, i) => (
						<DesktopNavItem
							key={item.type === "link" ? item.to : `dropdown-${i}`}
							item={item}
						/>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-2">
					<div className="hidden md:flex md:items-center md:gap-2">
						<ThemeToggle />
						<AuthSection />
					</div>
					<MobileMenu />
				</div>
			</div>
		</header>
	);
}
