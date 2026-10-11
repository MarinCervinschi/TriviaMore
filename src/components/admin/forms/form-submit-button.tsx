import { Button } from "@/components/ui/button";

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
