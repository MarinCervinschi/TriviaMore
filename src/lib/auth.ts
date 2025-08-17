import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { User } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { v4 as uuid } from "uuid";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

const adapter = PrismaAdapter(prisma) as any;

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter,
	callbacks: {
		async jwt({ token, account }) {
			if (account?.provider === "credentials") {
				token.credentials = true;
			}

			return token;
		},
		async session({ session, token }) {
			if (session && session.user) {
				const { password, ...userWithoutPassword } = session.user as any;
				session.user = userWithoutPassword;
			}

			return session;
		},
	},
	jwt: {
		encode: async function (params) {
			if (params.token?.credentials) {
				const sessionToken = uuid();

				if (!params.token.sub) {
					throw new Error("No user ID found in token");
				}

				const createdSession = await adapter?.createSession?.({
					sessionToken: sessionToken,
					userId: params.token.sub,
					expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
				});

				if (!createdSession) {
					throw new Error("Failed to create session");
				}

				return sessionToken;
			}

			return defaultEncode(params);
		},
	},
	providers: [
		Google,
		GitHub,
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					const validatedCredentials = loginSchema.parse(credentials);

					const user = await prisma.user.findFirst({
						where: {
							email: validatedCredentials.email,
						},
					});

					if (!user || !user.password) {
						return null;
					}

					const isValid = await bcrypt.compare(
						validatedCredentials.password,
						user.password
					);

					if (!isValid) {
						return null;
					}

					const userData: User = {
						id: user.id,
						role: user.role,
						name: user.name || undefined,
						email: user.email || undefined,
						image: user.image || null,
					};

					return userData;
				} catch (error) {
					console.error("Authorization error:", error);
					if (error instanceof Error) {
						throw error;
					}
					return null;
				}
			},
		}),
	],
});
