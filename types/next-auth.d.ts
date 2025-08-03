import NextAuth from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: User
    }

    interface User {
        id: string
        email: string
        name?: string | null
        role: Role
        image?: string | null
        username: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: Role
        username: string
        credentials?: boolean
    }
}
