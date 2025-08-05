import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"

export const useRegisterForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit: SubmitHandler<RegisterInput> = async (data) => {
        setIsLoading(true)
        
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const responseData = await response.json()

            if (response.ok) {
                toast.success("Account creato con successo! Ora puoi effettuare l'accesso.")
                router.push("/auth/login")
            } else {
                // Gestione errori specifici
                if (response.status === 400 && responseData.details) {
                    // Errori di validazione Zod - mostriamo errori per campo
                    responseData.details.forEach((error: { field: string; message: string }) => {
                        if (error.field === 'email') {
                            setError("email", { message: error.message })
                        } else if (error.field === 'name') {
                            setError("name", { message: error.message })
                        } else if (error.field === 'password') {
                            setError("password", { message: error.message })
                        }
                    })
                } else {
                    // Altri errori (es. email già esistente)
                    setError("root", {
                        message: responseData.error || "Si è verificato un errore durante la registrazione.",
                    })
                }
                toast.error(responseData.error || "Si è verificato un errore durante la registrazione.")
            }
        } catch (error) {
            console.error("Registration error:", error)
            setError("root", {
                message: "Si è verificato un errore durante la registrazione.",
            })
            toast.error("Si è verificato un errore durante la registrazione.")
        } finally {
            setIsLoading(false)
        }
    }

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting: isSubmitting || isLoading,
    }
}
