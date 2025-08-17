import { Role } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
	interface Session {
		user: User & DefaultSession["user"];
	}

	interface User {
		id: string;
		role: Role;
		name?: string;
		email?: string;
		image?: string | null;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		sub?: string;
		role?: Role;
		name?: string;
		email?: string;
		image?: string | null;
		credentials?: boolean;
	}
}
