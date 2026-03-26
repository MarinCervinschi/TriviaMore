import { Outlet, createFileRoute } from "@tanstack/react-router"
import {
  LandingFooter,
  footerSections,
} from "@/components/landing"
import { useAuth } from "@/hooks/useAuth"
import { Navbar } from "@/components/layout/navbar"
import { MinimalFooter } from "@/components/layout/minimal-footer"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {isAuthenticated ? (
        <MinimalFooter />
      ) : (
        <LandingFooter sections={footerSections} />
      )}
    </div>
  )
}
