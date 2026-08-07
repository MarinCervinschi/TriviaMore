import { Button } from "@/components/ui/button";

// Shared submit button for the admin CRUD forms: "Salvataggio…" while pending,
// then "Aggiorna <entity>" / "Crea <entity>" depending on edit vs create.
export function FormSubmitButton({
	isPending,
	isEdit,
	entityLabel,
}: {
	isPending: boolean;
	isEdit: boolean;
	entityLabel: string;
}) {
	return (
		<Button type="submit" disabled={isPending}>
			{isPending
				? "Salvataggio..."
				: isEdit
					? `Aggiorna ${entityLabel}`
					: `Crea ${entityLabel}`}
		</Button>
	);
}
