'use client';

import { User } from "next-auth";
import { PropsWithChildren } from 'react';
import { useUser } from "./UserProvider";
import Loader from "@/components/Common/Loader";

type ProtectedRouteProps = PropsWithChildren & {
    allowedRoles?: User['role'][];
};

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { user } = useUser();

    if (user === undefined) {
        return <Loader />; 
    }

    if (user === null || (allowedRoles && !allowedRoles.includes(user.role))) {
        return <div>Unauthorized</div>;
    }

    return <>{children}</>;
}