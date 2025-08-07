import React from "react";

import { AlertCircle } from "lucide-react";
import { FieldError, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormFieldProps {
	id: string;
	label: string;
	type: string;
	placeholder: string;
	autoComplete: string;
	register: UseFormRegister<any>;
	error?: FieldError;
	disabled?: boolean;
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
			<Label htmlFor={id} className="text-gray-700 dark:text-gray-300">
				{label}
			</Label>
			<Input
				{...register(id)}
				id={id}
				type={type}
				placeholder={placeholder}
				autoComplete={autoComplete}
				disabled={disabled}
				className={`dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${error ? "border-red-500 dark:border-red-400" : ""}`}
			/>
			{error && (
				<div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
					<AlertCircle className="h-4 w-4" />
					{error.message}
				</div>
			)}
		</div>
	);
};
