import { ArrowLeft, Zap } from "lucide-react";
import { User } from "next-auth";

import { Button } from "@/components/ui/button";
import { FlashcardSession } from "@/lib/types/flashcard.types";

interface FlashcardHeaderProps {
	session: FlashcardSession;
	isGuest: boolean;
	user?: User | null;
	onExit: () => void;
}

export function FlashcardHeader({
	session,
	isGuest,
	user,
	onExit,
}: FlashcardHeaderProps) {
	return (
		<header className="sticky top-0 z-10 border-b border-purple-100 bg-white/80 backdrop-blur-sm dark:border-purple-800 dark:bg-gray-900/80">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={onExit}
							className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Esci
						</Button>

						<div className="flex items-center space-x-3">
							<div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/50">
								<Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
									{session.section.name}
								</h1>
								<p className="text-sm text-gray-600 dark:text-gray-300">
									{session.section.class.course.name} - {session.section.class.name}
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center space-x-3">
						{!isGuest && user && (
							<div className="text-right">
								<p className="text-sm font-medium text-gray-900 dark:text-white">
									{user.name}
								</p>
								<p className="text-xs text-gray-600 dark:text-gray-300">
									Modalità Studio
								</p>
							</div>
						)}

						{isGuest && (
							<div className="text-right">
								<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
									Modalità Guest
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Accedi per salvare i progressi
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
