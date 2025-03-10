"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import QuizClass from "@/types/QuizClass"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import iconMap from "@/lib/iconMap"
import Loader from "@/components/Loader"
import Cookies from "js-cookie"
import { TbLogout2 } from "react-icons/tb";
import { MdAddToPhotos, MdManageSearch } from "react-icons/md";

export default function AdminDashboard() {
    const [classes, setClasses] = useState<QuizClass[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            const response = await fetch("/api/classes")
            if (response.ok) {
                const data = await response.json()
                const formattedData = data.map((row: any) => ({
                    ...row,
                    icon: iconMap[row.icon]
                }));
                setClasses(formattedData)
                setLoading(false)
            } else {
                throw new Error("Failed to fetch classes")
            }
        } catch (error) {
            console.error("Error fetching classes:", error)
            alert("Failed to load classes. Please try again.")
        }
    }

    const handleLogout = async () => {
        Cookies.remove("admin_token")
        Cookies.remove("admin_username")
        router.push("/admin/login")
    }

    if (loading) {
        return <Loader />
    }

    return (
        <DefaultLayout >
            <div className="w-full max-w-5xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <Button onClick={handleLogout}>Logout<TbLogout2 /></Button>
                </div>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Quiz Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {classes.length > 0 ?
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {classes.map((quizClass) => (
                                    <Card key={quizClass.id}>
                                        <CardHeader>
                                            <CardTitle><span className="flex gap-1">{quizClass.icon} {quizClass.name}</span></CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Link href={`/admin/class/${quizClass.id}`}>
                                                <Button>Manage <MdManageSearch /></Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div> :
                            <p className="text-red-500 text-xl">No classes found</p>
                        }
                    </CardContent>
                </Card>
                <Button asChild>
                    <Link href="/admin/class/new">Add New Class <MdAddToPhotos/></Link>
                </Button>
            </div>
        </DefaultLayout>
    )
}

