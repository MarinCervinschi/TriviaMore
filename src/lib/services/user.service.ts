import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type {
	RemoveClassFromUserListResponse,
	UserClassResponse,
} from "../types/user.types";

export interface UserPermissions {
	userId: string;
	role: "SUPERADMIN" | "ADMIN" | "MAINTAINER" | "STUDENT";
	managedDepartmentIds: string[];
	maintainedCourseIds: string[];
	accessibleSectionIds: string[];
}

export interface UserProfileData {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
	role: Role;
	createdAt: Date;
	updatedAt: Date;
	_count: {
		quizAttempts: number;
		userClasses: number;
		bookmarks: number;
	};
	recentActivity?: {
		quizAttempts: Array<{
			id: string;
			score: number;
			completedAt: Date;
			quiz: {
				section: {
					name: string;
					class: {
						name: string;
						course: {
							name: string;
							department: {
								name: string;
							};
						};
					};
				};
			};
		}>;
	};
	stats?: {
		totalQuizzes: number;
		averageScore: number;
		bestScore: number;
		totalTimeSpent: number;
		favoriteSubjects: Array<{
			name: string;
			count: number;
		}>;
	};
}

export class UserService {
	protected static async getUserPermissions(userId: string): Promise<UserPermissions> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				managedDepartments: {
					select: { departmentId: true },
				},
				maintainedCourses: {
					select: { courseId: true },
				},
				accessibleSections: {
					select: { sectionId: true },
				},
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return {
			userId,
			role: user.role,
			managedDepartmentIds: user.managedDepartments.map(m => m.departmentId),
			maintainedCourseIds: user.maintainedCourses.map(m => m.courseId),
			accessibleSectionIds: user.accessibleSections.map(a => a.sectionId),
		};
	}

	protected static async getSectionWhereClause(
		classId: string,
		permissions?: UserPermissions
	) {
		if (!permissions) {
			return {
				classId,
				isPublic: true,
				name: {
					not: "Exam Simulation",
				},
			};
		}

		if (permissions.role === "SUPERADMIN") {
			return {
				classId,
				name: {
					not: "Exam Simulation",
				},
			};
		}

		if (permissions.role === "ADMIN") {
			const classInfo = await prisma.class.findUnique({
				where: { id: classId },
				include: {
					course: {
						select: { departmentId: true },
					},
				},
			});

			if (
				classInfo &&
				permissions.managedDepartmentIds.includes(classInfo.course.departmentId)
			) {
				return {
					classId,
					name: {
						not: "Exam Simulation",
					},
				};
			}
		}

		return {
			classId,
			name: {
				not: "Exam Simulation",
			},
			OR: [
				{ isPublic: true },
				{
					id: {
						in: permissions.accessibleSectionIds,
					},
				},
			],
		};
	}

	/**
	 * Ottieni tutte le classi salvate/preferite dell'utente
	 */
	static async getUserSavedClasses(userId: string): Promise<UserClassResponse[]> {
		const userClasses = await prisma.userClass.findMany({
			where: { userId },
			include: {
				class: {
					include: {
						course: {
							include: {
								department: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return userClasses.map(uc => ({
			userId: uc.userId,
			classId: uc.classId,
			createdAt: uc.createdAt,
			updatedAt: uc.updatedAt,
			class: {
				id: uc.class.id,
				name: uc.class.name,
				code: uc.class.code,
				description: uc.class.description ?? undefined,
				classYear: uc.class.classYear,
				position: uc.class.position,
				course: {
					id: uc.class.course.id,
					name: uc.class.course.name,
					code: uc.class.course.code,
					courseType: uc.class.course.courseType,
					department: {
						id: uc.class.course.department.id,
						name: uc.class.course.department.name,
						code: uc.class.course.department.code,
					},
				},
			},
		}));
	}

	/**
	 * Aggiungi una classe alla lista preferiti dell'utente
	 */
	static async addClassToUserList(
		userId: string,
		classId: string
	): Promise<UserClassResponse> {
		// Verifica che la classe esista
		const classExists = await prisma.class.findUnique({
			where: { id: classId },
		});

		if (!classExists) {
			throw new Error("Classe non trovata");
		}

		// Verifica che l'utente esista
		const userExists = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!userExists) {
			throw new Error("Utente non trovato");
		}

		// Verifica che la classe non sia già nella lista
		const existingUserClass = await prisma.userClass.findUnique({
			where: {
				userId_classId: {
					userId,
					classId,
				},
			},
		});

		if (existingUserClass) {
			throw new Error("La classe è già nella tua lista");
		}

		// Aggiungi la classe alla lista dell'utente
		const userClass = await prisma.userClass.create({
			data: {
				userId,
				classId,
			},
			include: {
				class: {
					include: {
						course: {
							include: {
								department: true,
							},
						},
					},
				},
			},
		});

		return {
			userId: userClass.userId,
			classId: userClass.classId,
			createdAt: userClass.createdAt,
			updatedAt: userClass.updatedAt,
			class: {
				id: userClass.class.id,
				name: userClass.class.name,
				code: userClass.class.code,
				description: userClass.class.description ?? undefined,
				classYear: userClass.class.classYear,
				position: userClass.class.position,
				course: {
					id: userClass.class.course.id,
					name: userClass.class.course.name,
					code: userClass.class.course.code,
					courseType: userClass.class.course.courseType,
					department: {
						id: userClass.class.course.department.id,
						name: userClass.class.course.department.name,
						code: userClass.class.course.department.code,
					},
				},
			},
		};
	}

	/**
	 * Rimuovi una classe dalla lista preferiti dell'utente
	 */
	static async removeClassFromUserList(
		userId: string,
		classId: string
	): Promise<RemoveClassFromUserListResponse> {
		// Verifica che la classe sia nella lista dell'utente
		const existingUserClass = await prisma.userClass.findUnique({
			where: {
				userId_classId: {
					userId,
					classId,
				},
			},
		});

		if (!existingUserClass) {
			throw new Error("La classe non è nella tua lista");
		}

		// Rimuovi la classe dalla lista
		await prisma.userClass.delete({
			where: {
				userId_classId: {
					userId,
					classId,
				},
			},
		});

		return {
			success: true,
			message: "Classe rimossa dalla tua lista con successo",
		};
	}

	/**
	 * Verifica se una classe è nella lista dell'utente
	 */
	static async isClassInUserList(userId: string, classId: string): Promise<boolean> {
		const userClass = await prisma.userClass.findUnique({
			where: {
				userId_classId: {
					userId,
					classId,
				},
			},
		});

		return !!userClass;
	}

	/**
	 * Get user profile data by ID
	 */
	static async getUserProfile(userId: string): Promise<UserProfileData | null> {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				include: {
					_count: {
						select: {
							quizAttempts: true,
							userClasses: true,
							bookmarks: true,
						},
					},
					quizAttempts: {
						take: 5,
						orderBy: { completedAt: "desc" },
						include: {
							quiz: {
								include: {
									section: {
										include: {
											class: {
												include: {
													course: {
														include: {
															department: true,
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			});

			if (!user) return null;

			// Calculate stats
			const allQuizAttempts = await prisma.quizAttempt.findMany({
				where: { userId },
				include: {
					quiz: {
						include: {
							section: {
								include: {
									class: {
										include: {
											course: {
												include: {
													department: true,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			});

			const stats = this.calculateUserStats(allQuizAttempts);

			return {
				...user,
				recentActivity: {
					quizAttempts: user.quizAttempts,
				},
				stats,
			};
		} catch (error) {
			console.error("Error fetching user profile:", error);
			return null;
		}
	}

	/**
	 * Get user recent activity (all quiz attempts)
	 */
	static async getUserRecentActivity(userId: string) {
		try {
			const quizAttempts = await prisma.quizAttempt.findMany({
				where: { userId },
				orderBy: { completedAt: "desc" },
				include: {
					quiz: {
						include: {
							questions: true,
							evaluationMode: true,
							section: {
								include: {
									class: {
										include: {
											course: {
												include: {
													department: true,
												},
											},
										},
									},
								},
							},
						},
					},
					answers: true,
				},
			});

			// Map the data to match the expected interface
			return quizAttempts.map(attempt => ({
				id: attempt.id,
				score: attempt.score,
				totalQuestions: attempt.quiz.questions.length,
				correctAnswers: attempt.answers.filter(answer => answer.score > 0).length,
				completedAt: attempt.completedAt,
				duration: attempt.timeSpent,
				evaluationMode:
					attempt.quiz.evaluationMode.name === "Study Mode"
						? ("STUDY" as const)
						: ("EXAM" as const),
				section: {
					id: attempt.quiz.section.id,
					name: attempt.quiz.section.name,
					class: {
						id: attempt.quiz.section.class.id,
						name: attempt.quiz.section.class.name,
						course: {
							id: attempt.quiz.section.class.course.id,
							name: attempt.quiz.section.class.course.name,
							department: {
								id: attempt.quiz.section.class.course.department.id,
								name: attempt.quiz.section.class.course.department.name,
							},
						},
					},
				},
			}));
		} catch (error) {
			console.error("Error fetching user activity:", error);
			return [];
		}
	}

	/**
	 * Check if a user can view another user's profile
	 */
	static async canViewProfile(
		viewerUserId: string | undefined,
		targetUserId: string
	): Promise<boolean> {
		// Users can always view their own profile
		if (viewerUserId === targetUserId) return true;

		// For now, all profiles are public (you can change this logic)
		// You could add privacy settings to the User model
		return true;
	}

	/**
	 * Get user by ID (minimal data for checking existence)
	 */
	static async getUserById(userId: string) {
		return await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
			},
		});
	}

	/**
	 * Generate display name for user
	 */
	static getDisplayName(user: { name: string | null; email: string | null }): string {
		if (user.name) return user.name;
		if (user.email) return user.email.split("@")[0];
		return "Utente Anonimo";
	}

	/**
	 * Generate URL-friendly slug from user data
	 */
	static generateUserSlug(user: { id: string; name: string | null }): string {
		if (user.name) {
			// Convert "Mario Rossi" to "Mario-Rossi"
			return user.name
				.trim()
				.replace(/\s+/g, "-")
				.replace(/[^a-zA-Z0-9-]/g, "")
				.toLowerCase();
		}
		return user.id;
	}

	/**
	 * Get user progress data across all sections
	 */
	static async getUserProgressData(userId: string) {
		try {
			const progressData = await prisma.progress.findMany({
				where: { userId },
				include: {
					section: {
						include: {
							class: {
								include: {
									course: {
										include: {
											department: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: [{ lastAccessedAt: "desc" }],
			});

			return progressData;
		} catch (error) {
			console.error("Error fetching user progress:", error);
			return [];
		}
	}

	/**
	 * Get user bookmarks
	 */
	static async getUserBookmarks(userId: string) {
		try {
			const bookmarks = await prisma.bookmark.findMany({
				where: { userId },
				include: {
					question: {
						include: {
							section: {
								include: {
									class: {
										include: {
											course: {
												include: {
													department: true,
												},
											},
										},
									},
								},
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			return bookmarks;
		} catch (error) {
			console.error("Error fetching user bookmarks:", error);
			return [];
		}
	}

	/**
	 * Calculate user statistics
	 */
	private static calculateUserStats(quizAttempts: any[]) {
		if (quizAttempts.length === 0) {
			return {
				totalQuizzes: 0,
				averageScore: 0,
				bestScore: 0,
				totalTimeSpent: 0,
				favoriteSubjects: [],
			};
		}

		const totalQuizzes = quizAttempts.length;
		const averageScore =
			quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalQuizzes;
		const bestScore = Math.max(...quizAttempts.map(attempt => attempt.score));
		const totalTimeSpent = quizAttempts.reduce(
			(sum, attempt) => sum + (attempt.timeSpent || 0),
			0
		);

		// Calculate favorite subjects (departments)
		const subjectCounts = quizAttempts.reduce(
			(acc, attempt) => {
				const deptName = attempt.quiz.section.class.course.department.name;
				acc[deptName] = (acc[deptName] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const favoriteSubjects = Object.entries(subjectCounts)
			.map(([name, count]) => ({ name, count: count as number }))
			.sort((a, b) => (b.count as number) - (a.count as number))
			.slice(0, 5);

		return {
			totalQuizzes,
			averageScore: Math.round(averageScore * 100) / 100,
			bestScore: Math.round(bestScore * 100) / 100,
			totalTimeSpent,
			favoriteSubjects,
		};
	}
}
