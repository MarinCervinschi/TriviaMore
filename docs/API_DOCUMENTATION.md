# API Documentation - TriviaMore

## Introduction

TriviaMore's API is built on **Next.js App Router**, leveraging the file-based routing system for clean, predictable API endpoints. The API follows RESTful principles and provides structured access to the application's core functionality through organized route handlers.

### App Router Architecture

The API endpoints are organized in the `src/app/api/` directory using Next.js 13+ App Router convention:

- Each folder represents a route segment
- `route.ts` files contain the actual API handlers
- Dynamic routes use `[param]` folder naming
- Nested routes create hierarchical API structures

### Documentation Strategy

This project uses a **hybrid documentation approach**:

1. **Inline JSDoc comments** in `route.ts` files for detailed API specifications
2. **This overview document** for architecture, patterns, and quick reference
3. **TypeScript interfaces** for type safety and IDE support

This ensures documentation stays synchronized with code while providing comprehensive API coverage.

### Creating New API Routes

For **public routes**, create standard Next.js route handlers:

```typescript
// src/app/api/public-example/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * @api {GET} /api/public-example Get public data
 * @apiName GetPublicExample
 * @apiGroup Public
 *
 * @apiParam {String} [query] Search query parameter
 * @apiParam {Number} [limit=10] Number of results to return
 *
 * @apiSuccess {Object} result Response object
 * @apiSuccess {Object[]} result.data Array of data items
 * @apiSuccess {String} result.data.id Item ID
 * @apiSuccess {String} result.data.name Item name
 *
 * @apiError (500) InternalServerError Server error occurred
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const data = await fetchPublicData(searchParams.get("query"));

		return NextResponse.json({ data });
	} catch (error) {
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
```

For **protected routes**, use the `auth` wrapper from NextAuth v5:

```typescript
// src/app/api/protected/example/route.ts
import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";

/**
 * @api {GET} /api/protected/example Get user data
 * @apiName GetUserExample
 * @apiGroup Protected
 *
 * @apiParam {String} [filter] Filter criteria
 *
 * @apiSuccess {Object} result Response object
 * @apiSuccess {Object} result.data User-specific data
 * @apiSuccess {String} result.data.userId User ID
 * @apiSuccess {Object[]} result.data.items User's items
 *
 * @apiError (401) Unauthorized Authentication required
 * @apiError (500) InternalServerError Server error occurred
 */
export const GET = auth(async function GET(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = request.auth.user?.id;
	const data = await fetchUserData(userId);

	return NextResponse.json({ data });
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
```

### Authentication Strategy

TriviaMore implements a **hybrid authentication approach** optimized for edge runtime limitations and Neon PostgreSQL compatibility.

#### Why Not Standard NextAuth.js Middleware?

Unlike typical NextAuth.js implementations that use `withAuth` middleware, this project uses a custom authentication pattern for specific technical reasons:

**🏗️ Edge Runtime Limitations with Neon + Prisma**

```typescript
// ❌ Standard approach (not used due to edge limitations)
export { default } from "next-auth/middleware";
export const config = { matcher: ["/protected/:path*"] };
```

**The Problem:**

- **Edge Runtime**: Vercel Edge Functions have strict limitations
- **Neon PostgreSQL**: Direct database connections aren't available on edge runtime
- **Prisma**: Full Prisma client functionality is limited in edge environments
- **Session Validation**: Database-backed session validation requires Node.js runtime

**🎯 Our Solution: Two-Layer Authentication**

#### Layer 1: Lightweight Middleware Check

```typescript
// src/middleware.ts - Edge-compatible session cookie validation
export async function middleware(request: NextRequest) {
	const sessionCookieName =
		NODE_ENV === "production"
			? "__Secure-authjs.session-token"
			: "authjs.session-token";

	const sessionCookie = request.cookies.get(sessionCookieName)?.value;
	const isAuth = !!sessionCookie; // Simple session cookie presence check

	// Lightweight routing decisions based on cookie presence
	const isProtectedApi = request.nextUrl.pathname.startsWith("/api/protected");
	const isUserProfile = request.nextUrl.pathname.startsWith("/user");

	if ((isUserProfile || isProtectedApi) && !isAuth) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	return NextResponse.next();
}
```

**Benefits:**

- ✅ Runs efficiently on Vercel Edge
- ✅ No database connections required
- ✅ Fast session cookie presence checks
- ✅ Prevents unnecessary page loads for unauthenticated users

#### Layer 2: Route-Level Authentication

```typescript
// src/app/api/protected/user/profile/route.ts
import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";

export const GET = auth(async function GET(request: NextAuthRequest) {
	// Full authentication validation with database access
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = request.auth.user?.id;
	// Now we can safely perform database operations
	const userProfile = await UserService.getUserProfile(userId);

	return NextResponse.json(userProfile);
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
```

**Benefits:**

- ✅ Full NextAuth.js session validation with database lookup
- ✅ Database access for user permissions and roles
- ✅ Type-safe request handling with `NextAuthRequest`
- ✅ Granular authentication control per route

#### Why This Approach Works

1. **Performance**: Edge middleware handles initial routing without database overhead
2. **Compatibility**: Route-level auth runs in Node.js runtime with full database access
3. **Security**: Double validation ensures both session cookie presence and database session validity
4. **Flexibility**: Different routes can implement different authentication requirements
5. **Future-Proof**: Easy migration to full middleware auth when infrastructure changes

#### Production Considerations

```typescript
// Future migration path (when moving off Vercel Edge)
export const middleware = withAuth(
	function middleware(request) {
		// Full NextAuth middleware support
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				// Complex authorization logic with database access
				return !!token;
			},
		},
	}
);
```

This architecture provides the best of both worlds: edge performance with full authentication capabilities where needed.

---

## 📋 API Overview

### API Structure

- **Public Routes**: `/api/` - Contact forms, content browsing, authentication
- **Protected Routes**: `/api/protected/` - User data, quizzes, flashcards, admin operations
- **Guest Routes**: `/api/guest/` - Limited functionality for anonymous users

### Main Categories

- **Authentication**: Login, registration, session management via NextAuth.js
- **User Management**: Profiles, permissions, progress tracking, bookmarks
- **Content System**: Quizzes, flashcards with spaced repetition
- **Admin Operations**: Content management, user access control
- **Browse System**: Hierarchical content discovery (departments → courses → classes → sections)

---

## � Technical Implementation Notes

### Database Integration

- **Prisma ORM** for type-safe database operations
- **PostgreSQL** as the primary database (Neon in production)
- Optimized queries with proper indexing and relationships

### Error Handling

- Standardized error response format across all endpoints
- Proper HTTP status codes and descriptive error messages
- Input validation using Zod schemas for type safety

### Performance Considerations

- Edge-compatible middleware for fast routing decisions
- Route-level authentication for full database access
- Lazy loading for large hierarchical data structures
- Caching strategies for frequently accessed content

---

_This documentation focuses on architecture and patterns. Detailed endpoint specifications are maintained as JSDoc comments within individual route files for accuracy and synchronization with code._
