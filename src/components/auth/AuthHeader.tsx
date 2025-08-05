import React from "react"
import Link from "next/link"
import { BookOpen, ArrowLeft } from "lucide-react"

interface AuthHeaderProps {
    title: string
    subtitle: string
    showBackButton?: boolean
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ 
    title, 
    subtitle,
    showBackButton = true 
}) => {
    return (
        <div className="text-center mb-8">
            {showBackButton && (
                <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            )}
            <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">TriviaMore</h1>
            </div>
            <p className="text-gray-600">{subtitle}</p>
        </div>
    )
}
