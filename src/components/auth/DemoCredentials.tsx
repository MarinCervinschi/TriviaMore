import React from "react";

interface DemoCredentialsProps {
	credentials: Array<{
		role: string;
		email: string;
		password: string;
	}>;
}

export const DemoCredentials: React.FC<DemoCredentialsProps> = ({ credentials }) => {
	return (
		<div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
			<h3 className="mb-2 text-center font-semibold text-gray-900 dark:text-gray-100">
				Demo Credentials:
			</h3>
			<div className="space-y-1 text-sm">
				{credentials.map((cred, index) => (
					<div key={index} className="text-center text-gray-700 dark:text-gray-300">
						<strong>{cred.role}:</strong> {cred.email} / {cred.password}
					</div>
				))}
			</div>
		</div>
	);
};
