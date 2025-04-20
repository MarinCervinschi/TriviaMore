'use client'

import { useRouter } from "next/navigation"
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import QuizClass from "@/types/QuizClass"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import iconMap from "@/lib/iconMap"
import Loader from "@/components/Loader"
import Cookies from "js-cookie"
import { TbLogout2 } from "react-icons/tb"
import { MdAddToPhotos, MdManageSearch } from "react-icons/md"
import { toast } from "sonner"
import { getVisibility } from "../utils"

const fetchClasses = async (): Promise<QuizClass[]> => {
  const response = await fetch("/api/classes")
  if (!response.ok) {
    throw new Error("Failed to fetch classes")
  }
  return response.json()
}

export default function AdminDashboard() {
  const router = useRouter()

  const { data: classes, isLoading, isError, error } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: fetchClasses,
    staleTime: 1000 * 60 * 5 // 5 mins freshness
  })

  const handleLogout = () => {
    Cookies.remove("admin_token")
    Cookies.remove("admin_username")
    toast.success("Logged out successfully")
    router.push("/admin/login")
  }

  if (isLoading) return <Loader />
  if (isError) {
    toast.error("Failed to load classes. Please try again.")
    return <p className="text-red-500">Error: {(error as Error).message}</p>
  }

  return (
    <DefaultLayout>
      <div className="w-full max-w-5xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant={"destructive"}>
            Logout <TbLogout2 />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {(classes ?? []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(classes ?? []).map((quizClass) => (
                  <Card key={quizClass.id}>
                    <CardHeader>
                      <CardTitle>
                        <span className="flex gap-1">
                          {iconMap[quizClass.icon || 'default']} {quizClass.name}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Link href={`/admin/class/${quizClass.id}`}>
                          <Button>Manage <MdManageSearch /></Button>
                        </Link>
                        {getVisibility(quizClass.visibility)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-red-500 text-xl">No classes found</p>
            )}
          </CardContent>
        </Card>

        <Button asChild>
          <Link href="/admin/class/new">
            Add New Class <MdAddToPhotos />
          </Link>
        </Button>
      </div>
    </DefaultLayout>
  )
}