import { AppLayout } from "@/components/layouts/AppLayout";

export default function BrowsePage() {
	return (
		<AppLayout>
			<div className="container mx-auto px-4 py-8">
				<h1 className="mb-6 text-3xl font-bold">Browse Content</h1>
				<p className="text-muted-foreground">
					Qui puoi sfogliare tutti i contenuti disponibili per lo studio.
				</p>
			</div>
		</AppLayout>
	);
}
