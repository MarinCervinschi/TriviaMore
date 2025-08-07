import { UserProvider } from "@/providers/UserProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <UserProvider>{children}</UserProvider>;
}
