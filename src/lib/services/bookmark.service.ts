import { prisma } from "@/lib/prisma";

import { UserService } from "./user.service";

export interface BookmarkToggleResponse {
	success: boolean;
	action: "added" | "removed";
	message: string;
}

export interface BookmarkCheckResponse {
	isBookmarked: boolean;
}

export class BookmarkService extends UserService {
	/**
	 * Toggle bookmark for a question
	 */
	static async toggleBookmark(
		userId: string,
		questionId: string
	): Promise<BookmarkToggleResponse> {
		try {
			// Check if bookmark already exists
			const existingBookmark = await prisma.bookmark.findUnique({
				where: {
					userId_questionId: {
						userId,
						questionId,
					},
				},
			});

			if (existingBookmark) {
				// Remove bookmark
				await prisma.bookmark.delete({
					where: {
						userId_questionId: {
							userId,
							questionId,
						},
					},
				});

				return {
					success: true,
					action: "removed",
					message: "Segnalibro rimosso",
				};
			} else {
				// Add bookmark
				await prisma.bookmark.create({
					data: {
						userId,
						questionId,
					},
				});

				return {
					success: true,
					action: "added",
					message: "Segnalibro aggiunto",
				};
			}
		} catch (error) {
			console.error("Error toggling bookmark:", error);
			return {
				success: false,
				action: "added", // Default fallback
				message: "Errore nel gestire il segnalibro",
			};
		}
	}

	/**
	 * Check if a question is bookmarked by user
	 */
	static async checkBookmark(
		userId: string,
		questionId: string
	): Promise<BookmarkCheckResponse> {
		try {
			const bookmark = await prisma.bookmark.findUnique({
				where: {
					userId_questionId: {
						userId,
						questionId,
					},
				},
			});

			return {
				isBookmarked: !!bookmark,
			};
		} catch (error) {
			console.error("Error checking bookmark:", error);
			return {
				isBookmarked: false,
			};
		}
	}

	/**
	 * Get all user bookmarks with full question details
	 * Overrides the parent method with enhanced typing
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
	 * Get bookmark count for user
	 */
	static async getBookmarkCount(userId: string): Promise<number> {
		try {
			const count = await prisma.bookmark.count({
				where: { userId },
			});

			return count;
		} catch (error) {
			console.error("Error getting bookmark count:", error);
			return 0;
		}
	}

	/**
	 * Remove all bookmarks for a user
	 */
	static async clearUserBookmarks(userId: string): Promise<boolean> {
		try {
			await prisma.bookmark.deleteMany({
				where: { userId },
			});

			return true;
		} catch (error) {
			console.error("Error clearing user bookmarks:", error);
			return false;
		}
	}

	/**
	 * Get bookmarks by question IDs for a user
	 */
	static async getBookmarksByQuestionIds(
		userId: string,
		questionIds: string[]
	): Promise<string[]> {
		try {
			const bookmarks = await prisma.bookmark.findMany({
				where: {
					userId,
					questionId: {
						in: questionIds,
					},
				},
				select: {
					questionId: true,
				},
			});

			return bookmarks.map(bookmark => bookmark.questionId);
		} catch (error) {
			console.error("Error getting bookmarks by question IDs:", error);
			return [];
		}
	}
}
