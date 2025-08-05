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
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-center">Demo Credentials:</h3>
            <div className="text-sm space-y-1">
                {credentials.map((cred, index) => (
                    <div key={index} className="text-center">
                        <strong>{cred.role}:</strong> {cred.email} / {cred.password}
                    </div>
                ))}
            </div>
        </div>
    )
}
