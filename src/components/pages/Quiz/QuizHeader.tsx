import { Globe, Menu, User, X } from "lucide-react";
import { useSession } from "next-auth/react";

import { SimpleThemeToggle } from "@/components/Theme/simple-theme-toggle";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/lib/types/quiz.types";

import { QuizTimer } from "./QuizTimer";

interface QuizHeaderProps {
	quiz: Quiz;
	isGuest: boolean;
	onExit: () => void;
	onToggleSidebar: () => void;
	onTimeUp: () => void;
	sidebarOpen: boolean;
}

export function QuizHeader({
	quiz,
	isGuest,
	onExit,
	onToggleSidebar,
	onTimeUp,
	sidebarOpen,
}: QuizHeaderProps) {
	const { data: session } = useSession();

	return (
		<div className="quiz-header border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
			<div className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
				{/* Left side */}
				<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
					{/* Sidebar toggles */}
					<Button
						variant="ghost"
						size="sm"
						onClick={onToggleSidebar}
						className="flex-shrink-0 lg:hidden"
						title="Toggle sidebar"
					>
						<Menu className="h-5 w-5" />
					</Button>

					{!sidebarOpen && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onToggleSidebar}
							className="hidden flex-shrink-0 lg:flex"
							title="Mostra sidebar"
						>
							<Menu className="h-5 w-5" />
						</Button>
					)}

					{/* Title section - responsive */}
					<div className="min-w-0 flex-1">
						<h1 className="quiz-title truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-lg">
							<span className="hidden sm:inline">Quiz: </span>
							{quiz.section.name}
						</h1>
						<p className="quiz-subtitle truncate text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
							<span className="hidden lg:inline">
								{quiz.section.class.course.name} -{" "}
							</span>
							{quiz.section.class.name}
						</p>
					</div>
				</div>

				{/* Right side */}
				<div className="flex flex-shrink-0 items-center gap-1 sm:gap-3">
					{/* Timer */}
					{quiz.timeLimit && (
						<QuizTimer timeLimit={quiz.timeLimit} onTimeUp={onTimeUp} />
					)}

					{/* User info - hidden on small screens */}
					<div className="hidden items-center gap-2 lg:flex">
						{isGuest ? (
							<>
								<Globe className="h-4 w-4 text-gray-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">Guest</span>
							</>
						) : (
							<>
								<User className="h-4 w-4 text-blue-500" />
								<span className="max-w-20 truncate text-sm text-gray-700 dark:text-gray-300">
									{session?.user?.name || session?.user?.email}
								</span>
							</>
						)}
					</div>

					{/* Theme toggle */}
					<SimpleThemeToggle />

					{/* Exit button */}
					<Button
						variant="outline"
						size="sm"
						onClick={onExit}
						className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
					>
						<X className="h-4 w-4 sm:mr-2" />
						<span className="hidden sm:inline">Esci</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
