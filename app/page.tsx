import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/sign-out";
import { redirect } from "next/navigation";
import Link from "next/link";


export default async function LandingPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div>
      <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
        <p className="text-gray-600">Signed in as:</p>
        <p className="font-medium">{session?.user?.email}</p>
      </div>
      <Link href="/dashboard">
        <Button className="mb-4">Go to Dashboard</Button>
      </Link>
      <div className="text-center mb-6">
        <p className="text-gray-600">This is a protected page.</p>
      </div>

      <SignOut />
    </div>
  )
}
