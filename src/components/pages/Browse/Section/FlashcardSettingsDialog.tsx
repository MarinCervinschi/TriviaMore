import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FlashcardSettingsDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	sectionName: string;
	totalQuestions: number;
	cardCount: number[];
	onCardCountChange: (value: number[]) => void;
}

export function FlashcardSettingsDialog({
	isOpen,
	onOpenChange,
	sectionName,
	totalQuestions,
	cardCount,
	onCardCountChange,
}: FlashcardSettingsDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="w-full sm:w-auto">
					<Settings className="mr-2 h-4 w-4" />
					Impostazioni
				</Button>
			</DialogTrigger>
			<DialogContent className="mx-4 max-w-sm sm:mx-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Impostazioni Flashcard</DialogTitle>
					<DialogDescription>
						Personalizza le tue flashcard per la sezione {sectionName}.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6 py-4 sm:space-y-8 sm:py-6">
					<div className="space-y-4">
						<Label htmlFor="flashcard-count" className="text-sm font-medium">
							Numero di carte: {cardCount[0]}
						</Label>
						<div className="px-3">
							<Slider
								id="flashcard-count"
								min={Math.min(5, totalQuestions)}
								max={Math.min(totalQuestions, 30)}
								step={1}
								value={cardCount}
								onValueChange={onCardCountChange}
								className="w-full"
							/>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Da {Math.min(5, totalQuestions)} a {Math.min(totalQuestions, 30)} carte
						</p>
					</div>
				</div>
				<div className="flex flex-col space-y-2 border-t pt-4 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="w-full sm:w-auto"
					>
						Annulla
					</Button>
					<Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
						Salva Impostazioni
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
