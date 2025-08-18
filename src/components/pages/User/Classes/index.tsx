"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { ChevronRight, ExternalLink, Filter, Home, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserClassResponse } from "@/lib/types/user.types";

interface UserClassesComponentProps {
	userClasses: UserClassResponse[];
	currentUser: User;
}

export default function UserClassesComponent({
	userClasses,
	currentUser,
}: UserClassesComponentProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
	const [selectedCourseType, setSelectedCourseType] = useState<string>("all");
	const [selectedYear, setSelectedYear] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("name");

	// Extract unique values for filters
	const departments = useMemo(() => {
		const depts = [...new Set(userClasses.map(uc => uc.class.course.department.name))];
		return depts.sort();
	}, [userClasses]);

	const courseTypes = useMemo(() => {
		const types = [...new Set(userClasses.map(uc => uc.class.course.courseType))];
		return types.sort();
	}, [userClasses]);

	const years = useMemo(() => {
		const yrs = [...new Set(userClasses.map(uc => uc.class.classYear.toString()))];
		return yrs.sort();
	}, [userClasses]);

	// Filter and sort classes
	const filteredAndSortedClasses = useMemo(() => {
		let filtered = userClasses.filter(userClass => {
			const matchesSearch =
				userClass.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				userClass.class.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				userClass.class.course.department.name
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				userClass.class.code.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesDepartment =
				selectedDepartment === "all" ||
				userClass.class.course.department.name === selectedDepartment;

			const matchesCourseType =
				selectedCourseType === "all" ||
				userClass.class.course.courseType === selectedCourseType;

			const matchesYear =
				selectedYear === "all" || userClass.class.classYear.toString() === selectedYear;

			return matchesSearch && matchesDepartment && matchesCourseType && matchesYear;
		});

		// Sort classes
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.class.name.localeCompare(b.class.name);
				case "department":
					return a.class.course.department.name.localeCompare(
						b.class.course.department.name
					);
				case "year":
					return a.class.classYear - b.class.classYear;
				case "dateAdded":
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				default:
					return 0;
			}
		});

		return filtered;
	}, [
		userClasses,
		searchTerm,
		selectedDepartment,
		selectedCourseType,
		selectedYear,
		sortBy,
	]);

	const clearFilters = () => {
		setSearchTerm("");
		setSelectedDepartment("all");
		setSelectedCourseType("all");
		setSelectedYear("all");
		setSortBy("name");
	};

	const hasActiveFilters =
		searchTerm ||
		selectedDepartment !== "all" ||
		selectedCourseType !== "all" ||
		selectedYear !== "all";

	return (
		<div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
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
				<p className="text-muted-foreground">
					Gestisci i corsi che stai seguendo ({filteredAndSortedClasses.length} di{" "}
					{userClasses.length} corsi)
				</p>
			</div>

			{/* Filters Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Filter className="h-5 w-5" />
							Filtri
						</CardTitle>
						{hasActiveFilters && (
							<Button
								variant="outline"
								size="sm"
								onClick={clearFilters}
								className="flex items-center gap-1"
							>
								<X className="h-4 w-4" />
								Pulisci Filtri
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
						{/* Search */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Cerca</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Nome corso, dipartimento..."
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Department Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Dipartimento</label>
							<Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
								<SelectTrigger>
									<SelectValue placeholder="Tutti i dipartimenti" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tutti i dipartimenti</SelectItem>
									{departments.map(dept => (
										<SelectItem key={dept} value={dept}>
											{dept}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Course Type Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Tipo di Corso</label>
							<Select value={selectedCourseType} onValueChange={setSelectedCourseType}>
								<SelectTrigger>
									<SelectValue placeholder="Tutti i tipi" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tutti i tipi</SelectItem>
									{courseTypes.map(type => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Year Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Anno</label>
							<Select value={selectedYear} onValueChange={setSelectedYear}>
								<SelectTrigger>
									<SelectValue placeholder="Tutti gli anni" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tutti gli anni</SelectItem>
									{years.map(year => (
										<SelectItem key={year} value={year}>
											Anno {year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Sort By */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Ordina per</label>
							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="name">Nome Corso</SelectItem>
									<SelectItem value="department">Dipartimento</SelectItem>
									<SelectItem value="year">Anno</SelectItem>
									<SelectItem value="dateAdded">Data Aggiunta</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Courses Grid */}
			{filteredAndSortedClasses.length === 0 ? (
				<Card>
					<CardContent className="p-12">
						<div className="text-center">
							{userClasses.length === 0 ? (
								<>
									<h2 className="mb-2 text-xl font-semibold">Nessun corso salvato</h2>
									<p className="mb-4 text-muted-foreground">
										Esplora i dipartimenti e aggiungi i corsi che ti interessano!
									</p>
									<Button asChild>
										<Link href="/browse">Esplora Corsi</Link>
									</Button>
								</>
							) : (
								<>
									<h2 className="mb-2 text-xl font-semibold">Nessun corso trovato</h2>
									<p className="mb-4 text-muted-foreground">
										Prova a modificare i filtri di ricerca per trovare i corsi che stai
										cercando.
									</p>
									<Button onClick={clearFilters} variant="outline">
										Pulisci Filtri
									</Button>
								</>
							)}
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filteredAndSortedClasses.map(userClass => (
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
												href={`/browse/${userClass.class.course.department.code.toLowerCase()}/${userClass.class.course.code}/${userClass.class.code.toLowerCase()}`}
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
