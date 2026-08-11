import { toast } from "sonner";

/**
 * A success toast that carries its own reversal.
 *
 * Undo is what a confirmation dialog cannot be. A dialog's power is its rarity: shown often it
 * becomes background noise and stops being read, which is precisely where it is used most. So
 * confirmation belongs to the rare and irreversible, and undo to the frequent and reversible.
 *
 * Longer than the default toast on purpose — the reversal has to be noticed, read and reached.
 */
export function toastUndo(message: string, undo: () => void, label = "Annulla") {
	toast.success(message, {
		duration: 10_000,
		action: { label, onClick: undo },
	});
}
