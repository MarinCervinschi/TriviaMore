import React from "react";

import { AlertCircle } from "lucide-react";

interface AuthErrorMessageProps {
	message: string;
}

export const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({ message }) => {
	return (
		<div className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
			<AlertCircle className="h-4 w-4" />
			{message}
		</div>
	);
};
