import { Globe, Menu, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Quiz } from "@/lib/types/quiz.types";

import { QuizTimer } from "./QuizTimer";

interface QuizHeaderProps {
	quiz: Quiz;
	isGuest: boolean;
	user?: {
		id: string;
		name?: string | null;
		email?: string | null;
	} | null;
	onExit: () => void;
	onToggleSidebar: () => void;
	onTimeUp: () => void;
	sidebarOpen: boolean;
}

export function QuizHeader({
	quiz,
	isGuest,
	user,
	onExit,
	onToggleSidebar,
	onTimeUp,
	sidebarOpen,
}: QuizHeaderProps) {
	return (
		<div className="border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
			<div className="flex items-center justify-between px-4 py-3 sm:px-6">
				{/* Left side */}
				<div className="flex items-center space-x-4">
					{/* Mobile sidebar toggle */}
					<Button
						variant="ghost"
						size="sm"
						onClick={onToggleSidebar}
						className="lg:hidden"
					>
						<Menu className="h-5 w-5" />
					</Button>

					{/* Desktop sidebar toggle - solo quando chiusa */}
					{!sidebarOpen && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onToggleSidebar}
							className="hidden lg:flex"
							title="Mostra sidebar"
						>
							<Menu className="h-5 w-5" />
						</Button>
					)}

					<div>
						<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
							Quiz: {quiz.section.name}
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{quiz.section.class.course.name} - {quiz.section.class.name}
						</p>
					</div>
				</div>

				{/* Right side */}
				<div className="flex items-center space-x-4">
					{/* Timer */}
					{quiz.timeLimit && (
						<QuizTimer timeLimit={quiz.timeLimit} onTimeUp={onTimeUp} />
					)}

					{/* User info */}
					<div className="hidden items-center space-x-2 sm:flex">
						{isGuest ? (
							<>
								<Globe className="h-4 w-4 text-gray-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Modalità Guest
								</span>
							</>
						) : (
							<>
								<User className="h-4 w-4 text-blue-500" />
								<span className="text-sm text-gray-700 dark:text-gray-300">
									{user?.name || user?.email}
								</span>
							</>
						)}
					</div>

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
