import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("admin_token")?.value

  const isAdminDashboard = request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin"
  const isAdminApi = request.nextUrl.pathname.startsWith("/api/admin") && request.nextUrl.pathname !== "/api/admin/login"

  // Protect /admin and /api/admin routes
  if (isAdminDashboard || isAdminApi) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}