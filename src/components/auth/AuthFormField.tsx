import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { UseFormRegister, FieldError } from "react-hook-form"

interface AuthFormFieldProps {
    id: string
    label: string
    type: string
    placeholder: string
    autoComplete: string
    register: UseFormRegister<any>
    error?: FieldError
    disabled?: boolean
}

export const AuthFormField: React.FC<AuthFormFieldProps> = ({
    id,
    label,
    type,
    placeholder,
    autoComplete,
    register,
    error,
    disabled = false,
}) => {
    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <Input
                {...register(id)}
                id={id}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                className={error ? "border-red-500" : ""}
            />
            {error && (
                <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {error.message}
                </div>
            )}
        </div>
    )
}
