'use client';

import React from "react";
import ProtectedRoute from "@/providers/ProtectedRoute";
import DashboardPageComponent from "@/components/pages/Dashboard";
import { Role } from "@prisma/client";

const Roles = ["STUDENT", "MAINTAINER", "ADMIN", "SUPERADMIN"] as Role[];

export default function DashboardPage() {

    return (
        <ProtectedRoute allowedRoles={Roles}>
            <DashboardPageComponent />
        </ProtectedRoute>
    );
}