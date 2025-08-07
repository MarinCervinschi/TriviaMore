import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { NavigationUser } from "./types";
import { getUserInitials } from "./utils";

interface UserAvatarProps {
	user: NavigationUser;
	size?: "sm" | "md" | "lg";
}

const sizeClasses = {
	sm: "h-6 w-6",
	md: "h-8 w-8",
	lg: "h-10 w-10",
};

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
	return (
		<Avatar className={sizeClasses[size]}>
			<AvatarImage src={user.image || undefined} alt={user.name || "User"} />
			<AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
		</Avatar>
	);
}
