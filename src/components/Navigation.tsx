"use client";

import { useState } from "react";

import Link from "next/link";

import {
	BookOpen,
	GraduationCap,
	Home,
	LogOut,
	Menu,
	Settings,
	User,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { ThemeToggle } from "@/components/Theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";

export function Navigation() {
	const { data: session } = useSession();
	const [isOpen, setIsOpen] = useState(false);
    let user = undefined;
    if (!session) {
        user = null;
    } else {
        user = session.user;
    }

	const handleSignOut = async () => {
		await signOut({
            redirect: true,
            callbackUrl: "/auth/login",
        });
		setIsOpen(false);
	};

	const getUserInitials = (name?: string | null) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map(n => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// Navigation per utente ospite (non autenticato)
	const GuestNavigation = () => (
		<>
			{/* Desktop Navigation */}
			<div className="hidden items-center gap-4 md:flex">
				<Link href="/browse">
					<Button variant="ghost">Browse Content</Button>
				</Link>
				<ThemeToggle />
				<Link href="/auth/login">
					<Button variant="outline">Login</Button>
				</Link>
				<Link href="/auth/register">
					<Button>Get Started</Button>
				</Link>
			</div>

			{/* Mobile Navigation */}
			<div className="flex items-center gap-2 md:hidden">
				<ThemeToggle />
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Apri menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[300px] sm:w-[400px]">
						<div className="flex flex-col gap-4 py-4">
							<Link
								href="/browse"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-2 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
							>
								<BookOpen className="h-5 w-5" />
								Browse Content
							</Link>
							<hr />
							<Link
								href="/auth/login"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-2 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
							>
								Login
							</Link>
							<Link
								href="/auth/register"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-2 rounded-md px-2 py-3 text-lg font-medium text-blue-600 hover:bg-accent"
							>
								Get Started
							</Link>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);

	// Navigation per utente autenticato
	const AuthenticatedNavigation = () => (
		<>
			{/* Desktop Navigation */}
			<div className="hidden items-center gap-4 md:flex">
				<Link href="/dashboard">
					<Button variant="ghost" className="flex items-center gap-2">
						<Home className="h-4 w-4" />
						Dashboard
					</Button>
				</Link>
				<Link href="/browse">
					<Button variant="ghost" className="flex items-center gap-2">
						<BookOpen className="h-4 w-4" />
						Browse
					</Button>
				</Link>
				<Link href="/my-courses">
					<Button variant="ghost" className="flex items-center gap-2">
						<GraduationCap className="h-4 w-4" />
						<span className="hidden lg:inline">I miei Corsi</span>
						<span className="lg:hidden">Corsi</span>
					</Button>
				</Link>
				<ThemeToggle />

				{/* Avatar Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="relative h-8 w-8 rounded-full">
							<Avatar className="h-8 w-8">
								<AvatarImage
									src={user?.image || undefined}
									alt={user?.name || "User"}
								/>
								<AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="end" forceMount>
						<div className="flex items-center justify-start gap-2 p-2">
							<div className="flex flex-col space-y-1 leading-none">
								{user?.name && <p className="font-medium">{user.name}</p>}
								{user?.email && (
									<p className="w-[200px] truncate text-sm text-muted-foreground">
										{user.email}
									</p>
								)}
							</div>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href="/profile" className="flex items-center gap-2">
								<User className="h-4 w-4" />
								<span>Profilo</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/settings" className="flex items-center gap-2">
								<Settings className="h-4 w-4" />
								<span>Impostazioni</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleSignOut}
							className="cursor-pointer text-red-600 focus:text-red-600"
						>
							<LogOut className="mr-2 h-4 w-4" />
							<span>Logout</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Mobile Navigation */}
			<div className="flex items-center gap-2 md:hidden">
				<ThemeToggle />
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Apri menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[300px] sm:w-[400px]">
						<div className="flex flex-col gap-4 py-4">
							{/* User Info */}
							<div className="flex items-center gap-3 border-b px-2 py-3">
								<Avatar className="h-10 w-10">
									<AvatarImage
										src={user?.image || undefined}
										alt={user?.name || "User"}
									/>
									<AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
								</Avatar>
								<div className="flex flex-col space-y-1">
									{user?.name && <p className="font-medium">{user.name}</p>}
									{user?.email && (
										<p className="truncate text-sm text-muted-foreground">
											{user.email}
										</p>
									)}
								</div>
							</div>

							{/* Navigation Links */}
							<Link
								href="/dashboard"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
							>
								<Home className="h-5 w-5" />
								Dashboard
							</Link>
							<Link
								href="/browse"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
							>
								<BookOpen className="h-5 w-5" />
								Browse
							</Link>
							<Link
								href="/my-courses"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
							>
								<GraduationCap className="h-5 w-5" />I miei Corsi
							</Link>

							<hr />

							{/* User Actions */}
							<Link
								href="/profile"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
							>
								<User className="h-5 w-5" />
								Profilo
							</Link>
							<Link
								href="/settings"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
							>
								<Settings className="h-5 w-5" />
								Impostazioni
							</Link>
							<button
								onClick={handleSignOut}
								className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left text-lg font-medium text-red-600 hover:bg-accent"
							>
								<LogOut className="h-5 w-5" />
								Logout
							</button>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between py-4">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<Link href="/" className="flex items-center gap-2">
							<BookOpen className="h-8 w-8 text-blue-600" />
							<h1 className="text-2xl font-bold text-foreground">TriviaMore</h1>
						</Link>
					</div>

					{/* Navigation dinamica */}
					{user === undefined ? (
						<div className="flex items-center gap-4">
							<div className="h-9 w-24 animate-pulse rounded bg-muted"></div>
							<div className="h-9 w-9 animate-pulse rounded bg-muted"></div>
						</div>
					) : user ? (
						<AuthenticatedNavigation />
					) : (
						<GuestNavigation />
					)}
				</div>
			</div>
		</nav>
	);
}
