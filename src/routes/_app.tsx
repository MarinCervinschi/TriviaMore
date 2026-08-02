import { Outlet, createFileRoute } from "@tanstack/react-router"
import {
  LandingFooter,
  footerSections,
} from "@/components/landing"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { getSessionFn } from "@/lib/auth/api"
import { Navbar } from "@/components/layout/navbar"
import { LumaSidebar } from "@/components/layout/luma-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { DecorativeBackground } from "@/components/layout/decorative-background"

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
      <DecorativeBackground />

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
