import React from "react"
import { AlertCircle } from "lucide-react"

interface AuthErrorMessageProps {
    message: string
}

export const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({ message }) => {
    return (
        <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 mt-2">
            <AlertCircle className="w-4 h-4" />
            {message}
        </div>
    )
}
