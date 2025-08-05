import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("authjs.session-token")?.value

  const isAuth = !!sessionToken
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")

  // Protected routes
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")
  const isProtectedApi = request.nextUrl.pathname.startsWith("/api/protected")

  console.log(`Middleware: isAuth=${isAuth}, isAuthPage=${isAuthPage}, isDashboard=${isDashboard}, isProtectedApi=${isProtectedApi}`);
  if (isDashboard || isProtectedApi) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/api/auth/signin", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
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
