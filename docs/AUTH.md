# Authentication Documentation

This document describes the authentication system implemented in TriviaMore using NextAuth.js with multiple providers and a hybrid session strategy.

## Table of Contents

- [Overview](#overview)
- [Authentication Providers](#authentication-providers)
- [Session Strategy](#session-strategy)
- [Configuration](#configuration)
- [Middleware](#middleware)
- [Type Definitions](#type-definitions)
- [Usage Examples](#usage-examples)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Security Considerations](#security-considerations)

## Overview

The authentication system supports multiple authentication methods:
- **OAuth Providers**: GitHub, Google (using database sessions)
- **Credentials**: Username/password (using JWT with custom session creation)

The system uses a **hybrid approach**:
- OAuth providers create database sessions automatically
- Credentials provider uses JWT tokens but manually creates database sessions for consistency

## Authentication Providers

### 1. OAuth Providers (GitHub, Google)

```typescript
providers: [
    Google,
    GitHub,
    // ... other providers
]
```

**Flow:**
1. User clicks "Sign in with GitHub/Google"
2. Redirected to OAuth provider
3. After authorization, NextAuth.js creates:
   - User record (if new)
   - Account record (OAuth connection)
   - Session record (database session)
4. Session cookie is set with `sessionToken`

### 2. Credentials Provider

```typescript
CredentialsProvider({
    name: "credentials",
    credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
        // Validates username/password against database
        // Returns user object if valid
    }
})
```

**Flow:**
1. User submits username/password
2. `authorize` function validates credentials
3. JWT token is created with `credentials: true` flag
4. Custom `encode` function detects the flag and creates database session
5. Returns sessionToken instead of JWT

## Session Strategy

### OAuth Providers (GitHub, Google)
- **Strategy**: Database sessions
- **Storage**: PostgreSQL via Prisma
- **Token**: Session token stored in cookie (`authjs.session-token`)
- **Callbacks**: Only `session` callback is executed

### Credentials Provider
- **Strategy**: JWT → Database session (hybrid)
- **Storage**: PostgreSQL via Prisma (after JWT processing)
- **Token**: Session token stored in cookie
- **Callbacks**: `jwt` → `encode` → `session` callbacks are executed

## Configuration

### Main Configuration (`lib/auth.ts`)

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async jwt({ token, account }) {
            // Mark credentials authentication
            if (account?.provider === "credentials") {
                token.credentials = true
            }
            return token
        },
        async session({ session, token }) {
            // Normalize session data for all providers
            if (session && session.user) {
                session.user = {
                    id: session.user.id,
                    role: session.user.role,
                    name: session.user.name || undefined,
                    email: session.user.email || undefined,
                    image: session.user.image || null,
                }
            }
            return session;
        }
    },
    jwt: {
        encode: async function (params) {
            // Custom encoding for credentials provider
            if (params.token?.credentials) {
                const sessionToken = uuid()
                
                const createdSession = await adapter?.createSession?.({
                    sessionToken: sessionToken,
                    userId: params.token.sub,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                })
                
                return sessionToken
            }
            // Default JWT encoding for other cases
            return defaultEncode(params)
        }
    },
    providers: [Google, GitHub, CredentialsProvider({...})]
});
```

### Environment Variables

```env
# NextAuth
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
AUTH_GITHUB_ID=your-github-id
AUTH_GITHUB_SECRET=your-github-secret
AUTH_GOOGLE_ID=your-google-id
AUTH_GOOGLE_SECRET=your-google-secret

# Database
DATABASE_URL=postgresql://...
```

## Middleware

The middleware protects routes and handles authentication checks:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("authjs.session-token")?.value
  const isAuth = !!sessionToken
  
  // Protected routes
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")
  const isProtectedApi = request.nextUrl.pathname.startsWith("/api/protected")
  
  if (isDashboard || isProtectedApi) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/api/auth/signin", request.url))
    }
  }
  
  // Redirect authenticated users away from auth pages
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/auth/:path*"
  ],
}
```

**Protected Routes:**
- `/dashboard/*` - Dashboard pages
- `/api/protected/*` - Protected API endpoints
- `/auth/*` - Authentication pages (redirect if authenticated)

## Type Definitions

### NextAuth Session Extension (`types/next-auth.d.ts`)

```typescript
declare module "next-auth" {
    interface Session {
        user: User & DefaultSession["user"]
    }

    interface User {
        id: string
        role: Role  // Custom role from Prisma
        name?: string
        email?: string
        image?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        sub?: string
        role?: Role
        name?: string
        email?: string
        image?: string | null
        credentials?: boolean  // Flag for credentials provider
    }
}
```

### Validation Schemas (`lib/validations/auth.ts`)

```typescript
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const loginSchema = z.object({
  username: z.string().min(1, "Username richiesto"),
  password: z.string().min(1, "Password richiesta"),
})
```

## Usage Examples

### 1. Server Components

```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/api/auth/signin")
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Role: {session.user.role}</p>
      <p>Email: {session.user.email}</p>
    </div>
  )
}
```

### 2. API Routes

```typescript
// app/api/protected/user/route.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Check role-based access
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  return NextResponse.json({ user: session.user })
}
```

### 3. Client Components

```typescript
// components/user-profile.tsx
"use client"
import { useSession } from "next-auth/react"

export function UserProfile() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (status === "unauthenticated") return <p>Not authenticated</p>
  
  return (
    <div>
      <h2>{session?.user.name}</h2>
      <p>{session?.user.email}</p>
      <span>Role: {session?.user.role}</span>
    </div>
  )
}
```

### 4. Sign In/Out Actions

```typescript
// components/auth-buttons.tsx
import { signIn, signOut } from "@/lib/auth"

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github") // or "google", "credentials"
      }}
    >
      <button type="submit">Sign in with GitHub</button>
    </form>
  )
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit">Sign out</button>
    </form>
  )
}
```

### 5. Role-Based Access Control

```typescript
// lib/auth-utils.ts
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Authentication required")
  }
  return session
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Insufficient permissions")
  }
  return session
}

// Usage in API route
export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "MAINTAINER"])
    // Admin-only logic here
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}
```

## API Routes

### Authentication Endpoints

- `GET/POST /api/auth/signin` - Sign in page and handling (next-auth)
- `GET/POST /api/auth/signout` - Sign out handling (next-auth)
- `POST /api/auth/register` - User registration (credentials)

### Custom Registration Route

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }
    
    // Hash password and create user
    const hashedPassword = await hash(validatedData.password, 12)
    
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        role: "STUDENT" // Default role
      }
    })
    
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
```

## Database Schema

### Core Authentication Tables

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  username      String?   @unique
  password      String?   // Only for credentials auth
  role          Role      @default(STUDENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // NextAuth.js relations
  accounts Account[]
  sessions Session[]
  
  // Application relations
  quizAttempts QuizAttempt[]
  // ... other relations
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String  // "github", "google", etc.
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role {
  SUPERADMIN
  ADMIN
  MAINTAINER
  STUDENT
}
```

## Security Considerations

### 1. Password Security
- Passwords are hashed using bcryptjs with salt rounds of 12
- Passwords are only stored for credentials authentication
- OAuth users don't have passwords

### 2. Session Security
- Sessions expire after 30 days
- Session tokens are UUIDs (v4)
- Secure cookies in production

### 3. Environment Variables
- All secrets should be in environment variables
- Use different secrets for different environments
- Regularly rotate secrets

### 4. Role-Based Access
- Always check user roles in protected routes
- Use middleware for route-level protection
- Implement API-level authorization

### 5. Input Validation
- All inputs are validated using Zod schemas
- SQL injection protection via Prisma ORM
- XSS protection via proper data sanitization

## Troubleshooting

### Common Issues

1. **Session not found after credentials login**
   - Check if `encode` function is creating session properly
   - Verify database connection and Session table

2. **OAuth login creates JWT instead of session**
   - Remove `session: { strategy: "jwt" }` from configuration
   - Ensure PrismaAdapter is properly configured

3. **Middleware not protecting routes**
   - Check if sessionToken cookie exists
   - Verify middleware matcher patterns
   - Check if routes are correctly protected

4. **Role information missing**
   - Ensure session callback populates user.role
   - Check if User model has role field
   - Verify type definitions include role

### Debug Tips

```typescript
// Add to callbacks for debugging
callbacks: {
  async jwt({ token, account, user }) {
    console.log("JWT Callback:", { token, account, user })
    return token
  },
  async session({ session, token }) {
    console.log("Session Callback:", { session, token })
    return session
  }
}
```

## Migration Guide

If migrating from pure JWT to this hybrid approach:

1. Add PrismaAdapter and database models
2. Update session callback to handle both token and database sessions
3. Add custom encode function for credentials
4. Update middleware to check sessionToken cookie
5. Test both OAuth and credentials flows

This authentication system provides a robust, scalable solution that combines the benefits of both JWT and database sessions while maintaining security and user experience.
