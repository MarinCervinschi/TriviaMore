import React from "react"

interface DemoCredentialsProps {
    credentials: Array<{
        role: string
        email: string
        password: string
    }>
}

export const DemoCredentials: React.FC<DemoCredentialsProps> = ({ credentials }) => {
    return (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-gray-700">
            <h3 className="font-semibold mb-2 text-center text-gray-900 dark:text-gray-100">Demo Credentials:</h3>
            <div className="text-sm space-y-1">
                {credentials.map((cred, index) => (
                    <div key={index} className="text-center text-gray-700 dark:text-gray-300">
                        <strong>{cred.role}:</strong> {cred.email} / {cred.password}
                    </div>
                ))}
            </div>
        </div>
    )
}
