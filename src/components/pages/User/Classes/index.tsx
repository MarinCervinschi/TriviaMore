"use client";

import Link from "next/link";

import { ChevronRight, ExternalLink, Home } from "lucide-react";
import { User } from "next-auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { UserClassResponse } from "@/lib/types/user.types";

interface UserClassesComponentProps {
	userClasses: UserClassResponse[];
	currentUser: User;
}

export default function UserClassesComponent({
	userClasses,
	currentUser,
}: UserClassesComponentProps) {
	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
			{/* Breadcrumb */}
			<nav className="flex items-center space-x-2 text-sm text-muted-foreground">
				<Link href="/user" className="flex items-center gap-1 hover:text-foreground">
					<Home className="h-4 w-4" />
					Dashboard
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">I Miei Corsi</span>
			</nav>

			<div>
				<h1 className="text-3xl font-bold">I Miei Corsi</h1>
				<p className="text-muted-foreground">Gestisci i corsi che stai seguendo</p>
			</div>

			{userClasses.length === 0 ? (
				<Card>
					<CardContent className="p-6">
						<div className="text-center">
							<h2 className="mb-2 text-xl font-semibold">Nessun corso salvato</h2>
							<p className="mb-4 text-muted-foreground">
								Esplora i dipartimenti e aggiungi i corsi che ti interessano!
							</p>
							<Button asChild>
								<Link href="/browse">Esplora Corsi</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{userClasses.map(userClass => (
						<Card key={userClass.classId} className="transition-shadow hover:shadow-lg">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-lg">{userClass.class.name}</CardTitle>
										<CardDescription>
											{userClass.class.course.department.name}
										</CardDescription>
									</div>
									<Badge variant="outline">{userClass.class.course.courseType}</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<p className="font-medium">{userClass.class.course.name}</p>
										<p className="text-sm text-muted-foreground">
											Anno {userClass.class.classYear} • Codice: {userClass.class.code}
										</p>
									</div>

									{userClass.class.description && (
										<p className="text-sm text-muted-foreground">
											{userClass.class.description}
										</p>
									)}

									<div className="flex gap-2">
										<Button asChild size="sm" className="flex-1">
											<Link
												href={`/browse/${userClass.class.course.department.code.toLowerCase()}?class=${userClass.class.id}`}
												className="flex items-center gap-2"
											>
												Apri Corso
												<ExternalLink className="h-3 w-3" />
											</Link>
										</Button>
									</div>

									<div className="text-xs text-muted-foreground">
										Aggiunto il{" "}
										{new Date(userClass.createdAt).toLocaleDateString("it-IT")}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
