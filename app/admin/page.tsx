"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin/admin-dashboard-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (!storedToken || !storedUser) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(storedUser)
    if (userData.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    setUser(userData)
  }, [router])

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <AdminDashboardLayout user={user}>
      <AdminDashboard />
    </AdminDashboardLayout>
  )
}
