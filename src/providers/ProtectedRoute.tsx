"use client";

import { PropsWithChildren } from "react";

import { User } from "next-auth";

import Loader from "@/components/Common/Loader";

import { useUser } from "./UserProvider";

type ProtectedRouteProps = PropsWithChildren & {
	allowedRoles?: User["role"][];
};

export default function ProtectedRoute({
	allowedRoles,
	children,
}: ProtectedRouteProps) {
	const { user } = useUser();

	if (user === undefined) {
		return <Loader />;
	}

	if (user === null || (allowedRoles && !allowedRoles.includes(user.role))) {
		return <div>Unauthorized</div>;
	}

	return <>{children}</>;
}
