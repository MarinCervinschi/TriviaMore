import { GraduationCap } from "lucide-react";

import { AppLayout } from "@/components/layouts/AppLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function MyCoursesPage() {
	return (
		<AppLayout>
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="mb-2 text-3xl font-bold">I miei Corsi</h1>
					<p className="text-muted-foreground">
						Gestisci i tuoi corsi iscritti e monitora i progressi di apprendimento.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<GraduationCap className="h-5 w-5" />
							Corsi in Sviluppo
						</CardTitle>
						<CardDescription>
							Questa sezione è in fase di sviluppo e sarà disponibile presto.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Qui potrai vedere tutti i corsi a cui sei iscritto, i tuoi progressi e
							accedere ai materiali di studio.
						</p>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
