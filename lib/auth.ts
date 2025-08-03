import { v4 as uuid } from "uuid"
import NextAuth, { User } from "next-auth"
import { encode as defaultEncode } from "next-auth/jwt"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations"

const adapter = PrismaAdapter(prisma) as any

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter,
    callbacks: {
        async jwt({ token, account, user }) {
            if (user) {
                token.sub = user.id;
                token.role = user.role;
                token.username = user.username;
            }
            console.log("JWT Callback:", { token, account, user });

            if (account?.provider === "credentials") {
                token.credentials = true
            }

            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!;
                session.user.role = token.role;
                session.user.username = token.username;
            }
            else if (session.user) {
                session.user = {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    username: session.user.username,
                    role: session.user.role,
                    emailVerified: session.user.emailVerified,
                }
            }

            return session;
        }
    },
    jwt: {
        encode: async function (params) {
            console.log("JWT Encode Callback:", params);
            if (params.token?.credentials) {
                const sessionToken = uuid()

                if (!params.token.sub) {
                    throw new Error("No user ID found in token")
                }

                const createdSession = await adapter?.createSession?.({
                    sessionToken: sessionToken,
                    userId: params.token.sub,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
                })

                if (!createdSession) {
                    throw new Error("Failed to create session")
                }

                return sessionToken
            }

            return defaultEncode(params)
        }
    },
    providers: [
        Google,
        GitHub,
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const validatedCredentials = loginSchema.parse(credentials)

                    const user = await prisma.user.findFirst({
                        where: {
                            username: validatedCredentials.username
                        }
                    })

                    if (!user || !user.password) {
                        throw new Error("User not found")
                    }

                    const isValid = await bcrypt.compare(
                        validatedCredentials.password,
                        user.password
                    )

                    if (!isValid) {
                        throw new Error("Invalid credentials")
                    }

                    const userData: User = {
                        id: user.id,
                        email: user.email || "",
                        name: user.name || "",
                        image: user.image || null,
                        role: user.role,
                        username: user.username || "",
                    }

                    return userData
                } catch (error) {
                    console.error("Authorization error:", error)
                    throw new Error("Authorization failed")
                }
            },
        }),
    ],
});
