import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { useMutation } from "@tanstack/react-query"

export const useRegisterForm = () => {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    })

    const { mutate: registerUser, isPending } = useMutation({
        mutationFn: registerUserFetch,
        onSuccess: () => {
            toast.success("Account creato con successo! Ora puoi effettuare l'accesso.")
            router.push("/auth/login")
        },
        onError: (error: any) => {
            if (error.details) {
                error.details.forEach((err: { field: string; message: string }) => {
                    if (['email', 'name', 'password'].includes(err.field)) {
                        setError(err.field as keyof RegisterInput, {
                            message: err.message
                        })
                    }
                })
            } else {
                setError("root", {
                    message: error.error || "Si è verificato un errore durante la registrazione.",
                })
            }
            toast.error(error.error || "Si è verificato un errore durante la registrazione.")
        }
    })

    const onSubmit: SubmitHandler<RegisterInput> = (data) => {
        registerUser(data)
    }

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting: isPending,
    }
}

async function registerUserFetch(data: RegisterInput) {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }

    return response.json();
}