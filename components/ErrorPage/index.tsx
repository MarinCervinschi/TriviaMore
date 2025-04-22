'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, XOctagon, Ban } from 'lucide-react'
import DefaultLayout from '../Layouts/DefaultLayout'

interface ErrorPageProps {
    status?: number
    message?: string
    backTo?: string
}

const iconMap: Record<number, React.ReactNode> = {
    404: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
    500: <XOctagon className="w-12 h-12 text-red-500" />,
    403: <Ban className="w-12 h-12 text-orange-500" />,
}

export default function ErrorPage({ status = 500, message = "Something went wrong.", backTo = "/" }: ErrorPageProps) {
    const router = useRouter()

    const titleMap: Record<number, string> = {
        404: "Page Not Found",
        500: "Server Error",
        403: "Access Denied",
    }

    return (
        <DefaultLayout>
            <Card className="w-full max-w-lg text-center shadow-xl border-2 border-gray-200">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        {iconMap[status] || <XOctagon className="w-12 h-12 text-red-500" />}
                    </div>
                    <CardTitle className="text-3xl font-bold">
                        {status} - {titleMap[status] || "Unexpected Error"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">{message}</p>
                    <Button variant="default" onClick={() => router.push(backTo)}>
                        Go Back
                    </Button>
                </CardContent>
            </Card>
        </DefaultLayout>
    )
}