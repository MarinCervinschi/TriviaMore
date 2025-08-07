"use client";

import React from "react";

import Link from "next/link";

import { AuthErrorMessage } from "@/components/auth/AuthErrorMessage";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DemoCredentials } from "@/components/auth/DemoCredentials";
import { SocialAuthButton } from "@/components/auth/SocialAuthButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginForm } from "@/hooks/useLoginForm";

const demoCredentials = [
	{
		role: "Superadmin",
		email: "superadmin@example.com",
		password: "password123",
	},
	{
		role: "Student",
		email: "mario.rossi@example.com",
		password: "password123",
	},
];

const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV || "development";

export default function LoginPage() {
	const { register, handleSubmit, onSubmit, errors, isSubmitting } = useLoginForm();

	return (
		<AuthLayout>
			<AuthHeader title="Login" subtitle="Sign in to your account" />

			<Card className="border-0 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
				<CardHeader>
					<CardTitle className="text-gray-900 dark:text-gray-100">Login</CardTitle>
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
							<span className="w-full border-t border-gray-300 dark:border-gray-600" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-2 text-muted-foreground dark:bg-gray-800">
								Or continue with
							</span>
						</div>
					</div>

					{/* Credentials Form */}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
							autoComplete="current-password"
							register={register}
							error={errors.password}
							disabled={isSubmitting}
						/>

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? "Accesso in corso..." : "Sign In"}
						</Button>

						{errors.root && (
							<AuthErrorMessage message={errors.root.message || "Errore sconosciuto"} />
						)}
					</form>

					{/* Sign up link */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Don&#39;t have an account?{" "}
							<Link
								href="/auth/register"
								className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								Sign up
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>

			{NODE_ENV === "development" && <DemoCredentials credentials={demoCredentials} />}
		</AuthLayout>
	);
}
