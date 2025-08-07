"use client";

import {
	PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

import { User } from "next-auth";

type UserContext = {
	user?: User | null;
};

const UserContext = createContext<UserContext | undefined>(undefined);

type UserProviderProps = PropsWithChildren;

export function UserProvider({ children }: UserProviderProps) {
	const [user, setUser] = useState<User | null>();

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch("/api/auth/session");
				if (response.ok) {
					const session = await response.json();
					setUser(session?.user || null);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error("Error fetching user session:", error);
				setUser(null);
			}
		};

		fetchUser();
	}, []);

	return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

export function useUser() {
	const context = useContext(UserContext);

	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}

	return context;
}
