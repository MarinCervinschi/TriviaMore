import React from "react"
import { SimpleThemeToggle } from "@/components/Theme/simple-theme-toggle"

interface AuthLayoutProps {
    children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
            {/* Theme Toggle - Fixed position in top right corner */}
            <div className="fixed top-4 right-4 z-10">
                <SimpleThemeToggle />
            </div>
            
            {/* Main content */}
            <div className="w-full max-w-md">
                {children}
            </div>
            
            {/* Background decoration - Optional gradient orbs for modern look */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    )
}
