"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/AuthHeader"
import { AuthFormField } from "@/components/auth/AuthFormField"
import { AuthErrorMessage } from "@/components/auth/AuthErrorMessage"
import { SocialAuthButton } from "@/components/auth/SocialAuthButton"
import { useRegisterForm } from "@/hooks/useRegisterForm"

export default function RegisterPage() {
    const { register, handleSubmit, onSubmit, errors, isSubmitting } = useRegisterForm()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <AuthHeader 
                    title="Register"
                    subtitle="Create your account"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Social Auth Buttons */}
                        <div className="space-y-3">
                            <SocialAuthButton provider="google" disabled={isSubmitting} />
                            <SocialAuthButton provider="github" disabled={isSubmitting} />
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <AuthFormField
                                id="name"
                                label="Nome"
                                type="text"
                                placeholder="Il tuo nome"
                                autoComplete="name"
                                register={register}
                                error={errors.name}
                                disabled={isSubmitting}
                            />
                            
                            <AuthFormField
                                id="email"
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                register={register}
                                error={errors.email}
                                disabled={isSubmitting}
                            />
                            
                            <AuthFormField
                                id="password"
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                register={register}
                                error={errors.password}
                                disabled={isSubmitting}
                            />
                            
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Creazione account..." : "Create Account"}
                            </Button>
                            
                            {errors.root && (
                                <AuthErrorMessage message={errors.root.message || "Errore sconosciuto"} />
                            )}
                        </form>

                        {/* Sign in link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Hai già un account?{" "}
                                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Accedi
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
