"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import Loader from "@/components/Common/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useVolatileQuery } from "@/providers/react-query-provider";

// Tipi per le API
interface BrowseTreeResponse {
	departments: {
		id: string;
		name: string;
		code: string;
		description?: string;
		_count: { courses: number };
		courses: Array<{
			id: string;
			name: string;
			code: string;
			description?: string;
			_count: { classes: number };
		}>;
	}[];
}

interface SearchResults {
	departments: any[];
	courses: any[];
	classes: any[];
	sections: any[];
}

// Funzioni per le API calls
const fetchBrowseTree = async (): Promise<BrowseTreeResponse> => {
	const response = await fetch("/api/browse");
	if (!response.ok) {
		throw new Error("Errore nel fetch del tree");
	}
	return response.json();
};

const searchBrowse = async (query: string): Promise<SearchResults> => {
	const response = await fetch(`/api/browse?q=${encodeURIComponent(query)}&limit=10`);
	if (!response.ok) {
		throw new Error("Errore nella ricerca");
	}
	return response.json();
};

const expandCourse = async (courseId: string) => {
	const response = await fetch(
		`/api/browse?action=expand&nodeType=course&nodeId=${courseId}`
	);
	if (!response.ok) {
		throw new Error("Errore nell'espansione del corso");
	}
	return response.json();
};

export default function TestPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

	// Query persistenti - useranno il client persistente
	const {
		data: browseTree,
		isLoading: isLoadingTree,
		error: treeError,
		refetch: refetchTree,
	} = useQuery({
		queryKey: ["browseTree"],
		queryFn: fetchBrowseTree,
		staleTime: Infinity, // Questo sarà persistente
	});

	// Query volatili - useranno il client volatile
	const {
		data: searchResults,
		isLoading: isLoadingSearch,
		error: searchError,
		refetch: refetchSearch,
	} = useVolatileQuery({
		queryKey: ["search", searchQuery],
		queryFn: () => searchBrowse(searchQuery),
		enabled: searchQuery.length > 2,
	}) as {
		data: SearchResults | undefined;
		isLoading: boolean;
		error: Error | null;
		refetch: () => void;
	};

	// Query per espandere corso - persistente
	const {
		data: courseData,
		isLoading: isLoadingCourse,
		error: courseError,
		refetch: refetchCourse,
	} = useQuery({
		queryKey: ["course", selectedCourse],
		queryFn: () => expandCourse(selectedCourse!),
		enabled: !!selectedCourse,
	});

	const handleSearch = () => {
		if (searchQuery.length > 2) {
			refetchSearch();
		}
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="text-center">
				<h1 className="mb-2 text-3xl font-bold">Test React Query Provider</h1>
				<p className="text-muted-foreground">
					Test per verificare il funzionamento del client persistente e volatile
				</p>
			</div>

			{/* Sezione Browse Tree (Persistente) */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						Browse Tree
						<Badge variant="secondary">Persistente</Badge>
					</CardTitle>
					<CardDescription>
						Questo utilizza il client persistente - i dati vengono salvati in
						localStorage
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex gap-2">
						<Button onClick={() => refetchTree()} disabled={isLoadingTree}>
							{isLoadingTree ? "Caricamento..." : "Ricarica Tree"}
						</Button>
					</div>

					{isLoadingTree && <Loader />}

					{treeError && (
						<div className="rounded bg-red-50 p-3 text-red-500">
							Errore: {(treeError as Error).message}
						</div>
					)}

					{browseTree && (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Trovati {browseTree.departments.length} dipartimenti
							</p>
							<div className="grid gap-3">
								{browseTree.departments.map(dept => (
									<div key={dept.id} className="rounded border p-3">
										<h3 className="font-semibold">
											{dept.name} ({dept.code})
										</h3>
										<p className="mb-2 text-sm text-muted-foreground">
											{dept.description}
										</p>
										<div className="space-y-2">
											{dept.courses.map(course => (
												<div
													key={course.id}
													className="cursor-pointer rounded bg-gray-50 p-2 hover:bg-gray-100"
													onClick={() => setSelectedCourse(course.id)}
												>
													<span className="font-medium">{course.name}</span>
													<span className="ml-2 text-sm text-muted-foreground">
														({course.code}) - {course._count.classes} classi
													</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sezione Ricerca (Volatile) */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						Ricerca
						<Badge variant="outline">Volatile</Badge>
					</CardTitle>
					<CardDescription>
						Questo utilizza il client volatile - i dati non vengono persistiti
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex gap-2">
						<input
							type="text"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							placeholder="Cerca... (min 3 caratteri)"
							className="flex-1 rounded border px-3 py-2"
						/>
						<Button
							onClick={handleSearch}
							disabled={isLoadingSearch || searchQuery.length < 3}
						>
							{isLoadingSearch ? "Ricercando..." : "Cerca"}
						</Button>
					</div>

					{isLoadingSearch && <Loader />}

					{searchError && (
						<div className="rounded bg-red-50 p-3 text-red-500">
							Errore: {(searchError as Error).message}
						</div>
					)}

					{searchResults && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
								<div>
									<h4 className="mb-2 font-medium">
										Dipartimenti ({searchResults.departments.length})
									</h4>
									{searchResults.departments.map((item: any) => (
										<div
											key={item.id}
											className="mb-1 border-l-2 border-blue-500 pl-2 text-sm"
										>
											{item.name}
										</div>
									))}
								</div>
								<div>
									<h4 className="mb-2 font-medium">
										Corsi ({searchResults.courses.length})
									</h4>
									{searchResults.courses.map((item: any) => (
										<div
											key={item.id}
											className="mb-1 border-l-2 border-green-500 pl-2 text-sm"
										>
											{item.name}
										</div>
									))}
								</div>
								<div>
									<h4 className="mb-2 font-medium">
										Classi ({searchResults.classes.length})
									</h4>
									{searchResults.classes.map((item: any) => (
										<div
											key={item.id}
											className="mb-1 border-l-2 border-yellow-500 pl-2 text-sm"
										>
											{item.name}
										</div>
									))}
								</div>
								<div>
									<h4 className="mb-2 font-medium">
										Sezioni ({searchResults.sections.length})
									</h4>
									{searchResults.sections.map((item: any) => (
										<div
											key={item.id}
											className="mb-1 border-l-2 border-purple-500 pl-2 text-sm"
										>
											{item.name}
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sezione Espansione Corso (Persistente) */}
			{selectedCourse && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Dettagli Corso
							<Badge variant="secondary">Persistente</Badge>
						</CardTitle>
						<CardDescription>
							Dati del corso selezionato - anche questi vengono persistiti
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="mb-4 flex gap-2">
							<Button onClick={() => refetchCourse()} disabled={isLoadingCourse}>
								{isLoadingCourse ? "Caricamento..." : "Ricarica Corso"}
							</Button>
							<Button variant="outline" onClick={() => setSelectedCourse(null)}>
								Chiudi
							</Button>
						</div>

						{isLoadingCourse && <Loader />}

						{courseError && (
							<div className="rounded bg-red-50 p-3 text-red-500">
								Errore: {(courseError as Error).message}
							</div>
						)}

						{courseData && (
							<div className="space-y-3">
								<p className="text-sm text-muted-foreground">
									Trovate {courseData.classes?.length || 0} classi
								</p>
								{courseData.classes?.map((cls: any) => (
									<div key={cls.id} className="rounded border p-3">
										<h4 className="font-medium">
											{cls.name} ({cls.code})
										</h4>
										<p className="text-sm text-muted-foreground">
											Anno: {cls.classYear} - {cls._count.sections} sezioni
										</p>
										{cls.description && (
											<p className="mt-1 text-sm">{cls.description}</p>
										)}
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Informazioni Debug */}
			<Card>
				<CardHeader>
					<CardTitle>Debug Info</CardTitle>
					<CardDescription>Informazioni sui client React Query</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 text-sm">
						<div>
							<strong>Client Persistente:</strong> staleTime: Infinity, gcTime: 1
							settimana
						</div>
						<div>
							<strong>Client Volatile:</strong> staleTime: 5 minuti, gcTime: 30 minuti
						</div>
						<div>
							<strong>Persister:</strong> localStorage con chiave
							&apos;PERSISTENT_QUERY_CACHE&apos;
						</div>
						<div className="mt-4">
							<Button
								variant="outline"
								onClick={() => {
									localStorage.removeItem("PERSISTENT_QUERY_CACHE");
									window.location.reload();
								}}
							>
								Cancella Cache Persistente
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
