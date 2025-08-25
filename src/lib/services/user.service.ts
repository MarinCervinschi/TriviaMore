import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { SectionNode } from "../types/browse.types";
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
interface UserProfileStats {
	totalQuizzes: number;
	averageScore: number;
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
	recentClasses?: Array<{
		id: string;
		name: string;
		code: string;
		classYear: number;
		course: {
			id: string;
			name: string;
			code: string;
			courseType: string;
			department: {
				id: string;
				name: string;
				code: string;
			};
		};
	}>;
	stats?: UserProfileStats;
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

	static async getUserSectionsAccess(
		userId: string,
		classId: string
	): Promise<SectionNode[]> {
		const permissions = await this.getUserPermissions(userId);
		const whereClause = await this.getSectionWhereClause(classId, permissions);
		const sections = await prisma.section.findMany({
			where: whereClause,
			orderBy: { position: "asc" },
			include: {
				_count: {
					select: {
						questions: true,
					},
				},
				questions: {
					select: { questionType: true },
				},
			},
		});

		return sections.map(section => {
			const quizQuestions = section.questions.filter(
				q => q.questionType === "TRUE_FALSE" || q.questionType === "MULTIPLE_CHOICE"
			).length;
			const flashcardQuestions = section.questions.filter(
				q => q.questionType === "SHORT_ANSWER"
			).length;

			return {
				id: section.id,
				name: section.name,
				description: section.description ?? undefined,
				isPublic: section.isPublic,
				position: section.position,
				classId: section.classId,
				_count: {
					questions: section._count.questions,
					quizQuestions,
					flashcardQuestions,
				},
			};
		});
	}
	static async updateUserRecentClass(userId: string, classId: string): Promise<void> {
		try {
			await prisma.userRecentClasses.upsert({
				where: {
					userId_classId: {
						userId,
						classId,
					},
				},
				update: {
					lastVisited: new Date(),
					visitCount: {
						increment: 1,
					},
				},
				create: {
					userId,
					classId,
					lastVisited: new Date(),
					visitCount: 1,
				},
			});
		} catch (error) {
			console.log("Error updating user recent class:", error);
			throw error;
		}
	}

	static async countUserSectionsAccessByCourse(
		userId: string,
		courseId: string
	): Promise<Record<string, number>> {
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			include: {
				classes: {
					include: {
						sections: {
							select: {
								id: true,
							},
						},
					},
				},
			},
		});

		if (!course) {
			throw new Error("Course not found");
		}

		const permissions: UserPermissions = await this.getUserPermissions(userId);

		const result: Record<string, number> = {};

		await Promise.all(
			course.classes.map(async cls => {
				const sectionWhereClause = await this.getSectionWhereClause(
					cls.id,
					permissions
				);

				const accessibleSectionsCount = await prisma.section.count({
					where: sectionWhereClause,
				});

				result[cls.id] = accessibleSectionsCount;
			})
		);

		return result;
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
			const [user, progressData, recentClassesData, quizAttempts] = await Promise.all([
				prisma.user.findUnique({
					where: { id: userId },
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
						role: true,
						createdAt: true,
						updatedAt: true,
						_count: {
							select: {
								quizAttempts: true,
								userClasses: true,
								bookmarks: true,
							},
						},
					},
				}),

				prisma.progress.findMany({
					where: { userId },
					select: {
						quizMode: true,
						averageScore: true,
						bestScore: true,
						quizzesTaken: true,
						totalTimeSpent: true,
						section: {
							select: {
								class: {
									select: {
										courseId: true,
									},
								},
							},
						},
					},
				}),

				prisma.userRecentClasses.findMany({
					where: { userId },
					orderBy: { lastVisited: "desc" },
					take: 6,
					select: {
						lastVisited: true,
						class: {
							select: {
								id: true,
								name: true,
								code: true,
								classYear: true,
								course: {
									select: {
										id: true,
										name: true,
										code: true,
										courseType: true,
										department: {
											select: {
												id: true,
												name: true,
												code: true,
											},
										},
									},
								},
							},
						},
					},
				}),

				prisma.quizAttempt.findMany({
					where: { userId },
					orderBy: { completedAt: "desc" },
					take: 3,
					select: {
						id: true,
						score: true,
						completedAt: true,
						quiz: {
							select: {
								section: {
									select: {
										name: true,
										class: {
											select: {
												name: true,
												course: {
													select: {
														name: true,
														department: {
															select: {
																name: true,
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
				}),
			]);

			if (!user) return null;

			const stats = this.calculateUserStatsFromProgress(progressData);

			const recentClasses = recentClassesData.map(urc => ({
				id: urc.class.id,
				name: urc.class.name,
				code: urc.class.code,
				classYear: urc.class.classYear,
				course: {
					id: urc.class.course.id,
					name: urc.class.course.name,
					code: urc.class.course.code,
					courseType: urc.class.course.courseType,
					department: urc.class.course.department,
				},
				mostRecentAttemptDate: urc.lastVisited,
			}));

			return {
				...user,
				recentActivity: {
					quizAttempts,
				},
				recentClasses,
				stats,
			};
		} catch (error) {
			console.error("Error fetching user profile:", error);
			return null;
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
	static getDisplayName(user: { name?: string | null; email?: string | null }): string {
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
	 * Calculate user statistics from Progress data
	 */
	private static calculateUserStatsFromProgress(progressData: any[]): UserProfileStats {
		if (progressData.length === 0) {
			return {
				totalQuizzes: 0,
				averageScore: 0,
			};
		}

		const studyProgress = progressData.filter(p => p.quizMode === "STUDY");
		const examProgress = progressData.filter(p => p.quizMode === "EXAM_SIMULATION");

		const totalQuizzes = progressData.reduce((sum, p) => sum + p.quizzesTaken, 0);

		const studyScores = studyProgress
			.map(p => p.averageScore)
			.filter(score => score !== null && score !== undefined);
		const examScores = examProgress
			.map(p => p.averageScore)
			.filter(score => score !== null && score !== undefined);

		const allScores = [...studyScores, ...examScores];
		const averageScore =
			allScores.length > 0
				? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
				: 0;

		return {
			totalQuizzes,
			averageScore: Math.round(averageScore * 100) / 100,
		};
	}
}
