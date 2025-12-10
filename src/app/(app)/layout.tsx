import type { ReactNode } from "react";
import { AppSidebar } from "@/widgets/navigation/app-sidebar";
import { AppTopbar } from "@/widgets/navigation/app-topbar";
import { MobileNavbar } from "@/widgets/navigation/mobile-navbar";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
			<AppSidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<AppTopbar />
				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">{children}</main>
				<MobileNavbar />
			</div>
		</div>
	);
}
