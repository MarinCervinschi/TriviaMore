import React from "react";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

type UserCardProps = {
    id: string;
    role: string;
    name: string;
    email: string;
    image: string;
};

function UserCard({ id, role, name, email, image }: UserCardProps) {
    return (
        <div className="flex items-center p-4 bg-white rounded-lg shadow-md gap-4 max-w-md">
            <Image
                src={image}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="text-sm text-gray-600">{email}</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {role}
                </span>
            </div>
        </div>
    );
}

export default async function DashboardPage() {
    const session = await auth();

    // Example user data (replace with your actual data source)
    const user = session?.user || {
        id: "example-id",
        role: "user",
        name: "John Doe",
        email: "johndoe@example.com",
        image: "https://via.placeholder.com/150",
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2>Protected Dashboard</h2>
            <UserCard {...user} />

            <Link href="/" className="mt-4 inline-block text-blue-600 underline">
                Go Home
            </Link>
        </div>
    );
}