"use client";

import { createContext, useContext } from "react";

import { User } from "next-auth";

const UserContext = createContext<User | undefined>(undefined);

export function UserProvider({
	user,
	children,
}: {
	user: User | undefined;
	children: React.ReactNode;
}) {
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
	const user = useContext(UserContext);

	if (user === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}

	return user;
}
