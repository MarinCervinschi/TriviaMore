import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NODE_ENV = process.env.NODE_ENV === "production";

export async function middleware(request: NextRequest) {
	const sessionTokenName = NODE_ENV
		? "__Secure-authjs.session-token"
		: "authjs.session-token.dev";
	const sessionToken = request.cookies.get(sessionTokenName)?.value;

	const isAuth = !!sessionToken;
	const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

	// Protected routes
	const isRoot = request.nextUrl.pathname === "/";
	const isUserProfile = request.nextUrl.pathname.startsWith("/user");
	const isProtectedApi = request.nextUrl.pathname.startsWith("/api/protected");

	if (isUserProfile || isProtectedApi) {
		if (!isAuth) {
			return NextResponse.redirect(new URL("/auth/login", request.url));
		}
	}

	if ((isAuthPage || isRoot) && isAuth) {
		return NextResponse.redirect(new URL("/user", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/user/:path*", "/api/protected/:path*", "/auth/:path*"],
};
