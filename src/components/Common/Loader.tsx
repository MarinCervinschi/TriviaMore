import React from "react";

const Loader: React.FC = () => (
	<div className="flex h-full min-h-screen items-center justify-center">
		<div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
	</div>
);

export default Loader;
