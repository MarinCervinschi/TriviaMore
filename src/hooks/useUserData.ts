import { UserProfileData } from "@/lib/services/user.service";
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
	});
};
