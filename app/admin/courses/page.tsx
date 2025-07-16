"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin/admin-dashboard-layout"
import { CourseManager } from "@/components/admin/course-manager"

export default function AdminCoursesPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
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
      <CourseManager />
    </AdminDashboardLayout>
  )
}
