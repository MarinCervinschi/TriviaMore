import { Outlet, createFileRoute } from "@tanstack/react-router"
import {
  LandingFooter,
  footerSections,
} from "@/components/landing"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { getSessionFn } from "@/lib/auth/server"
import { Navbar } from "@/components/layout/navbar"
import { LumaSidebar } from "@/components/layout/luma-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"

export const Route = createFileRoute("/_app")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["auth", "session"],
      queryFn: () => getSessionFn(),
    }),
  component: AppLayout,
})

function AppLayout() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* App-wide decorative background — visible for both guest and
          authenticated users; for authenticated users it also bridges the
          floating sidebar gutter for visual continuity. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
        <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute -right-20 top-40 h-[300px] w-[300px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
      </div>

      {!isAuthenticated && <Navbar />}
      {isAuthenticated && (
        <>
          <LumaSidebar />
          <MobileBottomNav />
        </>
      )}

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col",
          // Floating sidebar width (66) + left gap (12) + right gap (12) = 90px
          isAuthenticated && "md:pl-[90px]",
        )}
      >
        <main
          id="main-content"
          className={cn(
            "flex-1",
            // Bottom nav clearance on mobile for authenticated users (h-16 + iOS safe area).
            isAuthenticated &&
              "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0",
          )}
        >
          <Outlet />
        </main>
        {!isAuthenticated && <LandingFooter sections={footerSections} />}
      </div>
    </div>
  )
}
