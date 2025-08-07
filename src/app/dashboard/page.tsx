"use client";

import React from "react";

import { Role } from "@prisma/client";

import DashboardPageComponent from "@/components/pages/Dashboard";
import ProtectedRoute from "@/providers/ProtectedRoute";

const Roles = ["STUDENT", "MAINTAINER", "ADMIN", "SUPERADMIN"] as Role[];

export default function DashboardPage() {
	return (
		<ProtectedRoute allowedRoles={Roles}>
			<DashboardPageComponent />
		</ProtectedRoute>
	);
}
