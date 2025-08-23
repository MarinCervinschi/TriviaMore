import { useQuery } from "@tanstack/react-query";

import { ProgressData } from "@/components/pages/User/Progress";
import { UserProfileData } from "@/lib/services/user.service";
import { UserClassResponse } from "@/lib/types/user.types";
import { useVolatileQuery } from "@/providers/react-query-provider";

const fetchUserProfile = async () => {
	const response = await fetch(`/api/protected/user/profile`);
	if (!response.ok) {
		throw new Error("Failed to fetch user profile");
	}
	return response.json();
};

export const useUserData = (userId: string) => {
	return useVolatileQuery<UserProfileData>({
		queryKey: ["userProfile", userId],
		queryFn: () => fetchUserProfile(),
		enabled: !!userId,
	});
};

const fetchUserProgress = async () => {
	const response = await fetch(`/api/protected/user/progress`);
	if (!response.ok) {
		throw new Error("Failed to fetch user progress");
	}
	return response.json();
};

export const useUserProgress = (userId: string) => {
	return useQuery<ProgressData[]>({
		queryKey: ["userProgress", userId],
		queryFn: () => fetchUserProgress(),
		enabled: !!userId,
	});
};

const fetchUserClasses = async () => {
	const response = await fetch(`/api/protected/user/classes`);
	if (!response.ok) {
		throw new Error("Failed to fetch user classes");
	}
	return response.json();
};

export const useUserClasses = (userId: string) => {
	return useQuery<UserClassResponse[]>({
		queryKey: ["userClasses", userId],
		queryFn: () => fetchUserClasses(),
		enabled: !!userId,
	});
};

const fetchUserSectionsAccessCountByCourse = async (courseId: string) => {
	const response = await fetch(
		`/api/protected/user/sections-access?courseId=${courseId}`
	);
	if (!response.ok) {
		throw new Error("Failed to fetch user sections access");
	}
	return response.json();
};

export const useUserSectionsAccessCountByCourse = (
	userId: string,
	courseId: string
) => {
	return useQuery({
		queryKey: ["userSectionsAccess", userId, courseId],
		queryFn: () => fetchUserSectionsAccessCountByCourse(courseId),
		enabled: !!userId && !!courseId,
		retry: 1,
		refetchOnWindowFocus: false,
	});
};

const fetchUserSectionsAccessByClass = async (classId: string) => {
	const response = await fetch(
		`/api/protected/user/sections-access?classId=${classId}`
	);
	if (!response.ok) {
		throw new Error("Failed to fetch user sections access");
	}
	return response.json();
};

export const useUserSectionsAccessByClass = (userId: string, classId: string) => {
	return useQuery({
		queryKey: ["userSectionsAccess", userId, classId],
		queryFn: () => fetchUserSectionsAccessByClass(classId),
		enabled: !!userId && !!classId,
		retry: 1,
		refetchOnWindowFocus: false,
	});
};
